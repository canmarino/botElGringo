import { addKeyword, EVENTS } from '@builderbot/bot';
import { createWorker } from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { format as formatDate } from 'date-fns';
import { logError } from '../utils/utils.js'; // Importa el manejador de errores centralizado
import { gestionarContacto } from '../services/contactosFlow.js'; // Importa la función de gestión de contactos

const imageFlow = addKeyword(EVENTS.MEDIA).addAction(async (ctx, ctxFn) => {
    try {
        console.log('Recibí una imagen');


        // Guardar archivo temporal
        const tempFilePath = await ctxFn.provider.saveFile(ctx, { path: 'imagenes' });
        const date = new Date();
        const formattedDate = formatDate(date, 'MM-dd_HH-mm');
        const fileName = `${formattedDate}_${ctx.from}.jpeg`;

        // Crear un worker de Tesseract
        const worker = await createWorker('spa');
        try {
            // Procesar el archivo con Tesseract
            const ret = await worker.recognize(tempFilePath);
            const destinationDir = ret.data.text.toLowerCase().includes('transferencia')
                ? 'C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\CAJAS\\BANCO CREDICOOP\\TRANSFERENCIAS'
                : 'C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\CAJAS\\BANCO CREDICOOP\\NO RECONOCIDO';

            const nuevaRuta = path.join(destinationDir, fileName);

            
            // Mover el archivo procesado
            fs.rename(tempFilePath, nuevaRuta, (err) => {
                if (err) {
                    throw new Error(`Error al mover el archivo: ${err.message}`);
                } else {
                    console.log('Archivo movido correctamente a:', nuevaRuta);
                }
            });
            if (!ret.data.text.toLowerCase().includes('transferencia')) {
                 // Llamar a la función de gestión de contactos antes de GPT
                await gestionarContacto(ctx, ctxFn, nuevaRuta, true, null);
            }
        } finally {
            // Liberar recursos del worker
            await worker.terminate();
        }
    } catch (error) {
        // Usar el manejador de errores centralizado
        logError(error);
    }
});

export { imageFlow };
