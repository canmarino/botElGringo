import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';

const goodbyeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        const respuestaBot = `Chau\n` +
            `${ctx.pushName}\n` +
            `Hasta la próxima!!\n`;

        await gestionarContacto(ctx, ctxFn, ctxFn.state, true, respuestaBot);

        //const state = ctxFn.state
        const botOffForThisUser = ctxFn.state.get('botOffForThisUser')
        if (botOffForThisUser) {
            await ctxFn.state.update({ botOffForThisUser: false })
            return ctxFn.endFlow()
        }
        
        return ctxFn.endFlow(respuestaBot);
    })

export { goodbyeFlow };