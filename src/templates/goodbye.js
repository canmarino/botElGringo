import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';
import { logError } from '../utils/utils.js';
import { delayResponse } from '../utils/delay.js';

const goodbyeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        try {
            const respuestaBot = `Chau\n` +
                `${ctx.pushName}\n` +
                `Hasta la próxima!!\n`;

            await gestionarContacto(ctx, ctxFn, ctxFn.state, true, respuestaBot);

            const botOffForThisUser = ctxFn.state.get('botOffForThisUser');
            if (botOffForThisUser) {
                await ctxFn.state.update({ botOffForThisUser: false });
                return ctxFn.endFlow();
            }

            // Agregar un retraso aleatorio entre 10 y 30 segundos antes de responder
            await delayResponse(10000, 30000);
            
            return ctxFn.endFlow(respuestaBot);
        } catch (error) {
            logError(error);
        }
    });

export { goodbyeFlow };