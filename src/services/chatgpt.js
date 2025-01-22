import OpenAi from "openai";
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';

// API key y modelo configurados
const openaiApikey = config.openai_apikey;
const model = config.model;

// Historial de la conversación
let conversationHistory = [];

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

/**
 * Función de interacción con ChatGPT.
 * 
 * @param {string} prompt - Mensaje del sistema inicial.
 * @param {string} question - Pregunta del usuario.
 * @param {boolean} resetHistory - Reinicia el historial si es `true`.
 * @returns {string} Respuesta del modelo o un mensaje de error.
 */
export const chat = async (prompt, question, resetHistory = false) => {
    try {
        // Configuración del cliente OpenAI
        const openai = new OpenAi({
            apiKey: openaiApikey,
        });

        // Reiniciar historial si se indica
        if (resetHistory) {
            conversationHistory = [];
            console.log("Historial reiniciado.");
        }

        // Agregar el mensaje del sistema al historial si está vacío
        if (conversationHistory.length === 0) {
            conversationHistory.push({ role: "system", content: prompt });
        }

        // Agregar la pregunta del usuario al historial
        conversationHistory.push({ role: "user", content: question });

        console.log("Enviando la siguiente conversación al modelo:", conversationHistory);

        // Llamar al modelo con el historial completo
        const completion = await openai.chat.completions.create({
            model: model,
            messages: conversationHistory,
        });

        // Obtener y registrar la respuesta del modelo
        const answ = completion.choices[0].message.content.trim();
        conversationHistory.push({ role: "assistant", content: answ });
        console.log("Respuesta del modelo:", answ);

        return answ;
    } catch (err) {
        console.error("Error al conectar con OpenAI:", err.message);
        logError(err);
        return "Ocurrió un error al intentar procesar tu solicitud. Intenta de nuevo más tarde.";
    }
};