import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';
import { chat } from '../services/chatgpt.js';
import path from "path";
import fs from "fs";
import { logError } from '../utils/utils.js'; // Importar el manejador de errores centralizado
//import { registrarConversacion } from '../services/contactosFlow.js'

// Ruta al archivo prompt.txt
const pathConsultas = path.join(process.cwd(), "assets/prompts", "prompt.txt");

const obtenerDiaYHora = () => {
    const ahora = new Date();
    const diaActual = ahora.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const horaActual = ahora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' });
    return { diaActual, horaActual };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gptFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        try {

            // Llamar a la función de gestión de contactos antes de GPT
            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, null);

            // Verificar si el bot debe detenerse para este usuario
            const botOffForThisUser = ctxFn.state.get('botOffForThisUser');
            if (botOffForThisUser) {
                await ctxFn.state.update({ botOffForThisUser: false });
                return ctxFn.endFlow();
            }

            // Leer contenido del archivo prompt.txt
            let promptConsultas;
            try {
                promptConsultas = fs.readFileSync(pathConsultas, "utf8");
            } catch (err) {
                throw new Error(`No se pudo leer el archivo prompt.txt: ${err.message}`);
            }

            // Obtener día y hora actuales
            const { diaActual, horaActual } = obtenerDiaYHora();

            // Reemplazar las variables en el prompt
            promptConsultas = promptConsultas
                .replace(/\[DÍA ACTUAL\]/g, diaActual)
                .replace(/\[HORA ACTUAL\]/g, horaActual);

            // Llamar al modelo GPT con el prompt actualizado
            let response;
            try {
                response = await chat(promptConsultas, ctx.body);
            } catch (err) {
                throw new Error(`No se pudo obtener respuesta del modelo GPT: ${err.message}`);
            }

            // Introducir un delay antes de finalizar el flujo
            await delay(500);

            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, response);

            // Finalizar el flujo con la respuesta
            return ctxFn.endFlow(response);
        } catch (error) {
            //const errorLog = `Error en el flujo GPT:\nMessage: ${error.message}\nStack: ${error.stack}\nContext: ${JSON.stringify(ctx)}\n\n`;
            logError(error); // Registrar el error utilizando el manejador centralizado
        }
    });

export { gptFlow };
