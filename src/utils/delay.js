export const delayResponse = async (minMs, maxMs) => {
    try {
        if (minMs < 0 || maxMs < 0 || minMs > maxMs) {
            throw new Error('Valores de tiempo inválidos para el retraso.');
        }
        
        const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        await new Promise(resolve => setTimeout(resolve, delayTime));
    } catch (error) {
        console.error('Error en delayResponse:', error);
    }
};
