import { createProvider } from '@builderbot/bot';
import { MetaProvider } from '@builderbot/provider-meta';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { MongoAdapter } from '@builderbot/database-mongo';
import { config } from '../config/index.js';
import { logError } from '../utils/utils.js';

let providerMeta, providerBaileys, adapterDB;

const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_BASE = 5000;
const MAX_RECONNECT_DELAY = 120000;
const RECONNECTION_PAUSE = 1800000;

let reconnectAttempts = 0;
let isReconnecting = false;

try {
    providerMeta = createProvider(MetaProvider, {
        jwtToken: config.jwtToken,
        numberId: config.numberId,
        verifyToken: config.verifyToken,
        version: config.version,
    });
} catch (error) {
    logError(error);
    console.error('❌ Error al crear el proveedor Meta:', error);
}

try {
    providerBaileys = createProvider(BaileysProvider, {
        writeMyself: 'both',
        syncFullHistory: false,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: (attempt) => Math.min(MAX_RECONNECT_DELAY, RECONNECT_DELAY_BASE * (2 ** attempt)),
    });
} catch (error) {
    logError(error);
    console.error('❌ Error al crear el proveedor Baileys:', error);
}

const reconnectBaileys = async () => {
    if (isReconnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
    
    isReconnecting = true;
    reconnectAttempts++;
    const delay = Math.min(RECONNECT_DELAY_BASE * (2 ** reconnectAttempts), MAX_RECONNECT_DELAY);
    console.log(`⚡ Intentando reconectar a Baileys en ${delay / 1000} segundos...`);

    setTimeout(async () => {
        try {
            await providerBaileys.connect();
            console.log('✅ Reconexión exitosa a Baileys.');
            reconnectAttempts = 0;
        } catch (error) {
            logError(error);
            console.error('❌ Error en la reconexión de Baileys:', error);
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                console.log(`⏸️ Esperando 30 minutos antes de intentar nuevamente.`);
                setTimeout(() => {
                    reconnectAttempts = 0;
                    reconnectBaileys();
                }, RECONNECTION_PAUSE);
            }
        } finally {
            isReconnecting = false;
        }
    }, delay);
};

if (providerBaileys) {
    providerBaileys.on('connection.update', (update) => {
        try {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
                if (shouldReconnect) reconnectBaileys();
                else console.log('❌ Credenciales inválidas. Se requiere nueva autenticación.');
            } else if (connection === 'open') {
                console.log('✅ Conectado exitosamente a Baileys.');
                reconnectAttempts = 0;
            }
        } catch (error) {
            logError(error);
            console.error('❌ Error en el manejo de eventos de Baileys:', error);
        }
    });
}

try {
    adapterDB = new MongoAdapter({
        dbUri: config.mongoURI,
        dbName: config.mongoDB,
    });
} catch (error) {
    logError(error);
    console.error('❌ Error al inicializar la base de datos:', error);
}

export { providerMeta, providerBaileys, adapterDB };
