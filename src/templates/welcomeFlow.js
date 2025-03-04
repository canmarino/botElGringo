import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';
import { delayResponse } from '../utils/delay.js';

const welcomeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        try {

            const respuesta = [
                `Hola!\n` + `${ctx.pushName}\n` + `Gracias por contactarte con\n` + `MAYORISTA EL GRINGO`,
                `Hola, ` + `${ctx.pushName}\n` + `Bienvenido a MAYORISTA EL GRINGO`,
                `Hola, ` + `${ctx.pushName}\n` + `¿En qué puedo ayudarte?`
            ]

            const respuestaBot = respuesta[Math.floor(Math.random() * respuesta.length)];

            // Llamar a la función de gestión de contactos
            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, respuestaBot);

            // Verificar si el bot está desactivado para este usuario
            const botOffForThisUser = ctxFn.state.get('botOffForThisUser');
            if (botOffForThisUser) {
                await ctxFn.state.update({ botOffForThisUser: false });
                return ctxFn.endFlow();
            }

            // Agregar un retraso aleatorio entre 10 y 30 segundos antes de responder
            await delayResponse(10000, 30000);

            return ctxFn.endFlow(respuestaBot);
        } catch (error) {
            console.error('❌ Error en welcomeFlow:', error);
            return ctxFn.endFlow('Ocurrió un error inesperado. Inténtalo nuevamente más tarde.');
        }
    });

export { welcomeFlow };
