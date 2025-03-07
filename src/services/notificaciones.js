import fs from 'fs/promises';
import path from 'path';
import { logError } from '../utils/utils.js';

export async function generarNotificacion(grupo, mensajeUsuario, nombre, numero, date, imagen) {
    try {
        if (!grupo || !mensajeUsuario || !nombre || !numero || !date) {
            throw new Error("Faltan parámetros obligatorios.");
        }

        const basePaths = {
            clientes: "C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\BOT\\reparto",
            mostrador: "C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\BOT\\mostrador",
            proveedores: "C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\BOT\\proveedor"
        };

        if (!(grupo in basePaths)) {
            throw new Error(`Grupo inválido: ${grupo}`);
        }

        const basePath = basePaths[grupo];
        const dateShort = date.substring(0, 5);
        const dateFile = date.substring(6);
        const folderPath = path.join(basePath, dateShort);

        // Crear carpeta si no existe
        await fs.mkdir(folderPath, { recursive: true });

        // Procesar imagen si existe
        if (imagen === 'imagen') {
            const imageFileName = `${numero}_${nombre}_${dateFile}.jpeg`;
            const imagePath = path.join(folderPath, imageFileName);

            try {
                // Verificar si la imagen de origen existe antes de moverla
                await fs.access(mensajeUsuario);
                console.log(`✅ La imagen existe: ${mensajeUsuario}`);

                await fs.rename(mensajeUsuario, imagePath);
                console.log(`✅ Imagen movida correctamente a: ${imagePath}`);
            } catch (error) {
                console.error(`❌ Error al mover la imagen: ${error.message}`);
                throw new Error(`Error al mover la imagen: ${error.message} (Ruta: ${mensajeUsuario})`);
            }
        } else if (imagen === 'pdf') {
            // Guardar el archivo PDF en la carpeta
            const pdfFileName = `${numero}_${nombre}_${dateFile}.pdf`;
            const pdfPath = path.join(folderPath, pdfFileName);
            await fs.rename(mensajeUsuario, pdfPath);
            console.log(`✅ PDF movido correctamente a: ${pdfPath}`);

        } else {
            // Guardar el mensaje en un archivo de texto
            const fileName = `${numero}_${nombre}_${dateFile}.txt`;
            const filePath = path.join(folderPath, fileName);
            await fs.writeFile(filePath, mensajeUsuario, 'utf8');
            console.log(`✅ Archivo guardado en: ${filePath}`);
        }
    } catch (error) {
        logError(`❌ Error en generarNotificacion: ${error.message}`);
    }
}
