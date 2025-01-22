import { addKeyword, EVENTS } from '@builderbot/bot';
import { gestionarContacto } from '../services/contactosFlow.js';

const welcomeFlow = addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, ctxFn) => {
        
            const respuestaBot = `Hola!\n` +
            `${ctx.pushName}\n` +
            `Gracias por contactarte con\n` +
            `MAYORISTA EL GRINGO`;

        // Llamar a la función de gestión de contactos
        await gestionarContacto(ctx, ctxFn, ctxFn.state, true, respuestaBot);

        //const state = ctxFn.state
        const botOffForThisUser = ctxFn.state.get('botOffForThisUser')
        if (botOffForThisUser) {
            await ctxFn.state.update({ botOffForThisUser: false })
            return ctxFn.endFlow()
        }

        
        return ctxFn.endFlow(respuestaBot);   
    })

export { welcomeFlow };