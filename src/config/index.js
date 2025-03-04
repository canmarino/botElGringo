import "dotenv/config";

export const config = {
    // Agregar todas las variables de entorno
    PORT: process.env.PORT || 3009,
    provider: process.env.provider,

    /*
    // Meta
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: "v20.0",
    */

    // OpenAI
    openai_apikey: process.env.openai_apikey,
    model: process.env.model,

    // MongoDB
    mongoURI: process.env.mongoURI,
    mongoDB: process.env.mongoDB,

};
