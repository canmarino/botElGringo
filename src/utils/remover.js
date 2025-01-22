import fs from "fs";
import path from "path";

// Función para registrar errores en un archivo de log
const logError = (error) => {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, "error.log");
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Error: ${error.message}\n`;
    fs.appendFileSync(logFilePath, logMessage, "utf8");
};

// Función para eliminar un archivo
export const removeFile = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log(`File at ${filePath} deleted successfully.`);
        } else {
            console.log(`File at ${filePath} does not exist.`);
        }
    } catch (error) {
        console.error(`Error deleting file at ${filePath}: ${error.message}`);
        logError(error); // Registrar el error en el archivo de log
    }
};