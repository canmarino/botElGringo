import fs from 'fs/promises';
import { logError } from '../utils/utils.js';
//import { addKeyword } from '@builderbot/bot';
//import { join } from 'path';

async function registrarConversacion(conversacion) {
    const fechaUTC = new Date();
    fechaUTC.setHours(fechaUTC.getHours() - 3);
    const fecha = fechaUTC.toISOString().replace('T', ' ').slice(0, 19);
    const registro = `${fecha}: ${JSON.stringify(conversacion)}\n`;
    const archivoLog = 'C:\\Users\\Gaston\\Desktop\\PYTHON\\template_JS_basic\\logs\\conversaciones.txt';

    try {
        await fs.appendFile(archivoLog, registro, 'utf8');
        console.log('Conversación registrada');
    } catch (error) {
        console.error('Error al registrar la conversación:', error);
    }
}

export const gestionarContacto = async (ctx, ctxFn, transcript, registrar = true, respuestaBot) => {
    if (registrar) {

        if (ctx.body.toLowerCase().includes('voice')) {
            const conversacion = {
                usuario: ctx.from,
                mensajeUsuario: transcript,
                respuestaBot: respuestaBot,
                fecha: new Date().toISOString()
            }
            await registrarConversacion(conversacion);
        } else {
            const conversacion = {
                usuario: ctx.from,
                mensajeUsuario: ctx.body,
                respuestaBot: respuestaBot,
                fecha: new Date().toISOString()
            }
            await registrarConversacion(conversacion);
        }
       
    }

    try {
        const clientesFilePath = 'C:\\Users\\Gaston\\Desktop\\PYTHON\\template_JS_basic\\contactos\\clientes.txt';
        const proveedoresFilePath = 'C:\\Users\\Gaston\\Desktop\\PYTHON\\template_JS_basic\\contactos\\proveedores.txt';

        const buscarCliente = await fs.readFile(clientesFilePath, 'utf8');
        const buscarProveedor = await fs.readFile(proveedoresFilePath, 'utf8');

        let encontrado = false;

        const procesarContacto = async (archivo, grupo) => {
            const lineas = archivo.split('\n');
            for (const linea of lineas) {
                const [numero, ...nombreArray] = linea.split(' ');
                const nombre = nombreArray.join(' ');
                if (numero === ctx.from) {
                    try {
                        await delay(500);

                        if (ctx.body.toLowerCase().includes('voice')) {
                            await ctxFn.provider.sendText(
                                grupo,
                                `${nombre}\n +${numero}\n ${transcript}`
                            )

                        } else {
                        
                            await ctxFn.provider.sendText(
                                grupo,
                                `${nombre}\n +${numero}\n ${ctx.body}`
                            );
                        }
                        
                        encontrado = true;
                        break;
                    } catch (sendError) {
                        throw new Error(`Error al enviar mensaje: ${sendError.message}`);
                    }
                }
            }
        };

        await Promise.all([
            procesarContacto(buscarCliente, '5491151852902-1494850346@g.us'),
            procesarContacto(buscarProveedor, '5491151852902-1494848491@g.us')
        ]);

        if (encontrado) {
            await ctxFn.state.update({ botOffForThisUser: true });
        }
    } catch (error) {
        logError(error);
    }
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//const flow = addKeyword('magic keyword')
//  .addAction(async (_, { state, endFlow }) => {
//      const botOffForThisUser = state.get('botOffForThisUser');
//      await state.update({ botOffForThisUser: !botOffForThisUser });
//      if (botOffForThisUser) return endFlow();
//  })
//  .addAnswer('Hello!');
