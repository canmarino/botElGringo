import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';


const genAI = new GoogleGenerativeAI("AIzaSyDtSg3tkFRP0BftVAHrKtpcEXEN5PAWRlk");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function chat(prompt, text) {

    const formatPrompt = prompt + `\n\nEl input del usuario es el siguiente: ` + text;

    const result = await model.generateContent(formatPrompt);
    const response = result.response;
    const answ = response.text();
    return answ
}

export async function image2text(prompt, imagePath) {
    const resolvedPath = path.resolve(imagePath);
    const imageBuffer = fs.readFileSync(resolvedPath);

    const image = {
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: "image/png",
        },
    };

    const result = await model.generateContent([prompt, image]);

    return result.response.text();
}