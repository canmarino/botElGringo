import { addKeyword, EVENTS } from '@builderbot/bot';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { format as formatDate } from 'date-fns';
import { logError } from '../utils/utils.js'; // Importar el manejador de errores centralizado

const pdfFlow = addKeyword(EVENTS.DOCUMENT).addAction(async (ctx, ctxFn) => {
    try {
        console.log('Recibí un documento');

        // Cargar dinámicamente `require`
        const require = createRequire(import.meta.url);

        // Importar `pdf-parse` usando `require`
        const pdfparse = require('pdf-parse');

        // Guardar el archivo temporalmente
        const tempFilePath = await ctxFn.provider.saveFile(ctx, { path: 'pdfs' });
        const date = new Date();
        const formattedDate = formatDate(date, 'MM-dd_HH-mm');
        const fileName = `${formattedDate}_${ctx.from}.pdf`;

        // Leer y procesar el archivo PDF
        const pdffile = fs.readFileSync(tempFilePath);

        try {
            const data = await pdfparse(pdffile);

            // Determinar el directorio de destino basado en el contenido del PDF
            const destinationDir = data.text.toLowerCase().includes('transferencia')
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
        } catch (pdfError) {
            // Lanzar un error específico si ocurre durante el procesamiento del PDF
            throw new Error(`Error al procesar el PDF: ${pdfError.message}`);
        }
    } catch (error) {
        // Manejar cualquier error utilizando el manejador centralizado
        logError(error);
    }
});

export { pdfFlow };
