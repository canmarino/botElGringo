import { createBot } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import templates from './templates/index.js'; // Cambia a import y agrega .js
import { providerMeta, providerBaileys } from './provider/index.js'; // Cambia a import y agrega .js
import { config } from './config/index.js'; // Cambia a import y agrega .js

const PORT = config.PORT;


const main = async () => {
    const adapterFlow = templates;
    let adapterProvider;
    if (config.provider === "meta") {
        adapterProvider = providerMeta;
    } else if (config.provider === "baileys") {
        adapterProvider = providerBaileys;
    } else {
        console.log("ERROR: Falta agregar un provider al .env")
    }


    const adapterDB = new Database();

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    },
    {
        globalState: {
            encendido: true,
        }
    }
);

    httpServer(+PORT);
};

main();
