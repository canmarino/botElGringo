import { addKeyword, EVENTS } from '@builderbot/bot';
import { DetectIntention } from './intentionsFlow.js';
import { logError } from '../utils/utils.js'; // Importamos el manejador de errores

const stopFlow = addKeyword(['sip', 'nop'])
    .addAction(async (ctx, { state, flowDynamic }) => {
        try {
            // Obtén el estado actual o inicialízalo como `false` si no existe
            //const botOffForThisUser = state.get('botOffForThisUser') || false;

            const newState = ctx.body.toLowerCase() === 'sip'

            // Alterna el estado del bot para este usuario
            await state.update({ botOffForThisUser: newState });

            // Responde al usuario según el nuevo estado
            if (newState) {
                await flowDynamic('✅ El bot ha sido reactivado para este usuario.');
            } else {
                await flowDynamic('✅ El bot ha sido apagado para este usuario.');
            }
        } catch (error) {
            // Registrar el error y continuar la ejecución
            await logError(error, ctx, 'stopFlow');
        }
    });

const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state, gotoFlow, endFlow }) => {
        try {
            
            // Obtén el estado del bot para este usuario (inicialízalo si no existe)
            const botOffForThisUser = state.get('botOffForThisUser') || false;

            // Si el bot está apagado para este usuario, termina el flujo
            if (botOffForThisUser) {
                return endFlow();
            }

            if (ctx.key.fromMe) {
                return endFlow()
            }

            // Verifica si el mensaje proviene de un grupo
            const isMessageFromGroup = !!ctx.message.extendedTextMessage;

            if (isMessageFromGroup) {
                return endFlow();
            } else {
                return gotoFlow(DetectIntention);
            }
        } catch (error) {
            // Registrar el error y continuar la ejecución
            await logError(error, ctx, 'mainFlow');
        }
    });

export { mainFlow, stopFlow };
