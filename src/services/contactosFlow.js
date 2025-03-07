import fs from 'fs/promises';
import { logError } from '../utils/utils.js';
import { format as formatDate } from 'date-fns';
import { generarNotificacion } from './notificaciones.js';

const archivoLog = 'C:\\Users\\Gaston\\Desktop\\elGringo\\botWhatsapp\\logs\\conversaciones.txt';
const clientesFilePath = 'C:\\Users\\Gaston\\Desktop\\elGringo\\botWhatsapp\\contactos\\clientes.txt';
const proveedoresFilePath = 'C:\\Users\\Gaston\\Desktop\\elGringo\\botWhatsapp\\contactos\\proveedores.txt';
const mostradorFilePath = 'C:\\Users\\Gaston\\Desktop\\elGringo\\botWhatsapp\\contactos\\mostrador.txt';

const archivos = [
    { path: clientesFilePath, grupo: 'clientes' },
    { path: mostradorFilePath, grupo: 'mostrador' },
    { path: proveedoresFilePath, grupo: 'proveedores' }
];

const date = new Date();
const formattedDate = formatDate(date, 'MM-dd_HH-mm-ss_SSS');

async function registrarConversacion(conversacion) {
    try {
        const registro = `${formattedDate}: ${JSON.stringify(conversacion)}\n`;
        await fs.appendFile(archivoLog, registro, 'utf8');
        console.log('Conversación registrada');
    } catch (error) {
        logError('Error al registrar la conversación:', error);
    }
}

export const gestionarContacto = async (ctx, ctxFn, transcript, registrar = true, respuestaBot) => {
    try {
        let mensajeUsuario = ctx.body.toLowerCase().includes('voice') ? transcript : ctx.body;

        if (ctx.body.toLowerCase().includes('media')) {
            mensajeUsuario = 'imagen';
        }
        if (ctx.body.toLowerCase().includes('document')) {
            mensajeUsuario = 'pdf';
        }

        if (registrar) {
            const conversacion = {
                usuario: ctx.from,
                mensajeUsuario,
                respuestaBot: respuestaBot || '',
                fecha: new Date().toISOString()
            };
            await registrarConversacion(conversacion);
        }

        let encontrado = false;

        for (const { path, grupo } of archivos) {
            const archivo = await fs.readFile(path, 'utf8').catch(() => '');
            if (!archivo) continue;

            const lineas = archivo.split('\n');
            for (const linea of lineas) {
                const [numero, ...nombreArray] = linea.split(' ');
                const nombre = nombreArray.join(' ');

                if (numero === ctx.from) {
                    try {
                        if (mensajeUsuario === 'imagen' || mensajeUsuario === 'pdf') {
                            let tipo = mensajeUsuario
                            await generarNotificacion(grupo, transcript, nombre, numero, formattedDate, tipo);
                        } else {
                            await generarNotificacion(grupo, mensajeUsuario, nombre, numero, formattedDate);
                        }

                        encontrado = true;
                        break;
                    } catch (sendError) {
                        logError(`Error al enviar mensaje: ${sendError.message}`);
                    }
                }
            }
            if (encontrado) break;
        }

        if (encontrado) {
            await ctxFn.state.update({ botOffForThisUser: true });
        }
    } catch (error) {
        logError(error);
    }
};
