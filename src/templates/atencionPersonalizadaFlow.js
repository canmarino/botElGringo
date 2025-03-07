import { addKeyword } from "@builderbot/bot";
import { logError } from "../utils/utils.js";
import { format as formatDate } from "date-fns";
import { delayResponse } from "../utils/delay.js";
import fs from "fs/promises";
import path from "path";

const date = new Date();
const formattedDate = formatDate(date, "MM-dd_HH-mm-ss_SSS");
const dateShort = formattedDate.substring(0, 5);
const dateFile = formattedDate.substring(6);

const basePath = "C:\\Users\\Gaston\\Google Drive\\AÑO 2025\\BOT\\asistencia";
const folderPath = path.join(basePath, dateShort);

async function createFolderIfNotExists(folderPath) {
    try {
        await fs.mkdir(folderPath, { recursive: true });
    } catch (error) {
        logError("Error al crear la carpeta:", error);
    }
}

const atencionPersonalizadaFlow = addKeyword("humano")
    .addAction(async (ctx, ctxFn) => {
        try {
            await createFolderIfNotExists(folderPath);

            const nombre = ctx.pushName || "Desconocido";
            const numero = ctx.from || "0000000000";
            const registro = `${formattedDate}: ${JSON.stringify(`${nombre} +${numero} necesita asistencia`)}\n`;

            const fileName = `${numero}_${nombre}_${dateFile}.txt`;
            const filePath = path.join(folderPath, fileName);
            
            await fs.writeFile(filePath, registro, "utf8");
            console.log(`✅ Archivo guardado en: ${filePath}`);
            
            await ctxFn.state.update({ botOffForThisUser: true });
            console.log("botOffForThisUser", ctxFn.state.get("botOffForThisUser"));
            console.log("Conversación registrada");
        } catch (error) {
            logError("Error al registrar la conversación:", error);
        }
        
        try {
            await delayResponse(10000, 30000);
        } catch (error) {
            logError("Error en delayResponse:", error);
        }
    })
    .addAnswer("Ya te contacto con un humano para que te ayude");

export { atencionPersonalizadaFlow };
