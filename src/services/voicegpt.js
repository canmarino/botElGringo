import OpenAI from "openai";
import { config } from "../config/index.js";
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

// API key de OpenAI
const openaiApikey = config.openai_apikey;

// Función para convertir voz a texto
export const voice2text = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        const errorMessage = "El archivo no se encuentra en la ruta especificada.";
        console.error(errorMessage);
        logError(new Error(errorMessage));
        throw new Error(errorMessage);
    }
    try {
        const openai = new OpenAI({
            apiKey: openaiApikey,
        });

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });

        console.log("Transcripción completada exitosamente.");
        return response.text;
    } catch (error) {
        console.error(`Error durante la transcripción: ${error.message}`);
        logError(error);
        return "Error al procesar la transcripción de audio.";
    }
};