import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';
import { chat } from '../services/chatgpt.js';
import path from "path";
import fs from "fs";
import { logError } from '../utils/utils.js';
import { delayResponse } from '../utils/delay.js';

// Ruta al archivo prompt.txt
const pathConsultas = path.join(process.cwd(), "assets/prompts", "prompt.txt");

const obtenerDiaYHora = () => {
    const ahora = new Date();
    return {
        diaActual: ahora.toLocaleDateString("es-ES", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        horaActual: ahora.toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' }),
    };
};

const gptFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        try {
            // Manejo de contactos antes de GPT
            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, null);
            
            // Verificar si el bot está apagado para este usuario
            if (ctxFn.state.get('botOffForThisUser')) {
                await ctxFn.state.update({ botOffForThisUser: false });
                return ctxFn.endFlow();
            }

            // Leer contenido del archivo prompt.txt
            let promptConsultas;
            try {
                promptConsultas = fs.readFileSync(pathConsultas, "utf8");
            } catch (err) {
                logError(err);
                return ctxFn.endFlow("Lo siento, hubo un error al procesar tu consulta.");
            }

            // Obtener y reemplazar variables en el prompt
            const { diaActual, horaActual } = obtenerDiaYHora();
            promptConsultas = promptConsultas
                .replace(/\[DÍA ACTUAL\]/g, diaActual)
                .replace(/\[HORA ACTUAL\]/g, horaActual);

            // Llamar a GPT con el prompt actualizado
            let response;
            try {
                response = await chat(promptConsultas, ctx.body);
            } catch (err) {
                logError(err);
                return ctxFn.endFlow("No pude procesar tu consulta en este momento.");
            }
            
            // Manejo de contacto final con la respuesta
            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, response);
            
            // Introducir un retraso aleatorio antes de responder
            await delayResponse(10000, 30000);

            return ctxFn.endFlow(response);
        } catch (error) {
            logError(error);
            return ctxFn.endFlow("Ocurrió un error inesperado. Intenta nuevamente más tarde.");
        }
    });

export { gptFlow };
