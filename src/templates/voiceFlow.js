import { addKeyword, EVENTS } from "@builderbot/bot";
import { downloadFile, downloadFileBaileys } from "../utils/downloader.js";
import { config } from "../config/index.js";
import { voice2text } from "../services/voicegpt.js";
import { removeFile } from "../utils/remover.js";
import { chat } from "../services/chatgpt.js";
import path from "path";
import fs from "fs";
import { logError } from "../utils/utils.js"; // Importamos el manejador de errores
import { gestionarContacto } from "../services/contactosFlow.js";
import { delayResponse } from "../utils/delay.js";

// Ruta y lectura del archivo de prompts
const pathConsultas = path.join(process.cwd(), "assets/prompts", "prompt.txt");
let promptConsultas;

try {
    promptConsultas = fs.readFileSync(pathConsultas, "utf8");
} catch (fileError) {
    logError(new Error(`Error al leer el archivo de prompt: ${fileError.message}`));
    promptConsultas = ""; // Asignar un valor predeterminado si falla la lectura
}

// Flujo principal para manejar notas de voz
const voiceFlow = addKeyword(EVENTS.VOICE_NOTE)
    .addAction(async (ctx, ctxFn) => {

        let filePath;

        try {
            // Descarga del archivo de audio
            if (config.provider === "meta") {
                filePath = await downloadFile(ctx.url, config.jwtToken);
            } else if (config.provider === "baileys") {
                filePath = await downloadFileBaileys(ctx);
            } else {
                throw new Error("Falta agregar un provider al .env");
            }
        } catch (downloadError) {
            logError(downloadError);
            return ctxFn.endFlow("Ocurrió un error al descargar el archivo. Por favor, inténtelo nuevamente más tarde.");
        }

        let transcript;
        try {
            // Conversión de audio a texto
            transcript = await voice2text(filePath.filePath);
        } catch (transcriptError) {
            logError(transcriptError);
            // Limpieza de archivos en caso de error
            try {
                removeFile(filePath.filePath);
                removeFile(filePath.fileOldPath);
            } catch (cleanupError) {
                logError(cleanupError);
            }
            return ctxFn.endFlow("Ocurrió un error al procesar el audio. Por favor, inténtelo nuevamente más tarde.");
        }

        let response;
        try {

            // Llamar a la función de gestión de contactos antes de GPT
            await gestionarContacto(ctx, ctxFn, transcript, true, null);

            // Verificar si el bot debe detenerse para este usuario
            const botOffForThisUser = ctxFn.state.get('botOffForThisUser');
            if (botOffForThisUser) {
                await ctxFn.state.update({ botOffForThisUser: false });
                return ctxFn.endFlow();
            }

            // Generación de respuesta usando ChatGPT
            response = await chat(promptConsultas, transcript);
        } catch (chatError) {
            logError(chatError);
            return ctxFn.endFlow("Ocurrió un error al generar la respuesta. Por favor, inténtelo nuevamente más tarde.");
        }

        try {
            // Limpieza de archivos después del proceso
            removeFile(filePath.filePath);
            removeFile(filePath.fileOldPath);
        } catch (removeError) {
            logError(removeError);
        }

        // Agregar un retraso aleatorio entre 10 y 30 segundos antes de responder
        await delayResponse(10000, 30000);

        // Finaliza el flujo con la respuesta generada
        return ctxFn.endFlow(response);
    });

export { voiceFlow };
