import { createFlowRouting } from "@builderbot-plugins/langchain";
import { EVENTS } from "@builderbot/bot";
import { config } from "../config/index.js";
import path from "path";
import fs from "fs";
import { logError } from "../utils/utils.js"; // Importar el manejador de errores centralizado

import { gptFlow } from "./gptFlow.js";
import { welcomeFlow } from "./welcomeFlow.js";
import { goodbyeFlow } from "./goodbye.js";

// Ruta al archivo de prompt para detección de intención
const Prompt_DETECTED = path.join(process.cwd(), "assets/prompts", "prompt_Detection.txt");

// Leer el contenido del archivo de prompt
let promptDetected;
try {
    promptDetected = fs.readFileSync(Prompt_DETECTED, "utf8");
} catch (error) {
    logError(new Error(`No se pudo leer el archivo prompt_Detection.txt: ${error.message}`));
    throw error; // Interrumpe la ejecución si el archivo es crítico
}

export const DetectIntention = createFlowRouting
    .setKeyword(EVENTS.ACTION)
    .setIntentions({
        intentions: ["SALUDO", "FAQ", "DESPEDIDA", "NO_DETECTED"],
        description: promptDetected,
    })
    .setAIModel({
        modelName: "openai",
        args: {
            modelName: config.model,
            apikey: config.openai_apikey,
        },
    })
    .create({
        afterEnd(flow) {
            return flow.addAction(async (ctx, { state, gotoFlow }) => {
                try {
                    console.log("Detectando intención...");
                    const intention = await state.get("intention");
                    console.log("INTENCIÓN DETECTADA: ", intention);

                    switch (intention) {
                        case "SALUDO":
                            return gotoFlow(welcomeFlow);
                        case "FAQ":
                            return gotoFlow(gptFlow);
                        case "DESPEDIDA":
                            return gotoFlow(goodbyeFlow);
                        case "NO_DETECTED":
                        default:
                            return gotoFlow(gptFlow);
                    }
                } catch (error) {
                    logError(new Error(`Error en DetectIntention: ${error.message}`));
                    console.error("Error en DetectIntention:", error);
                }
            });
        },
    });
