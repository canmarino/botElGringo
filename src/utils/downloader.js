import { downloadMediaMessage } from "@adiwajshing/baileys";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const formats = {
    mp3: {
        code: "libmp3lame",
        ext: "mp3",
    },
};

const logError = (error) => {
    const errorLogPath = path.join(process.cwd(), "logs", "error.log");
    const logMessage = `${new Date().toISOString()} - ${error.message}\n`;

    if (!fs.existsSync(path.dirname(errorLogPath))) {
        fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });
    }

    fs.appendFileSync(errorLogPath, logMessage);
    console.error(error);
};

const convertAudio = async (filePath, format = "mp3") => {
    if (!filePath) {
        throw new Error("filePath is required");
    }

    const convertedFilePath = path.join(
        path.dirname(filePath),
        `${path.basename(filePath, path.extname(filePath))}.${formats[format].ext}`
    );

    await new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .audioCodec(formats[format].code)
            .audioBitrate("128k")
            .format(formats[format].ext)
            .output(convertedFilePath)
            .on("end", resolve)
            .on("error", (err) => {
                logError(err);
                reject(err);
            })
            .run();
    });

    return convertedFilePath;
};

export const downloadFile = async (url, token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(url, {
            method: "GET",
            headers,
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
        }

        const urlExtension = path.extname(url).slice(1);
        const mimeType = res.headers.get("content-type");
        const extension = mime.extension(mimeType) || urlExtension || "bin";

        const fileName = `file-${Date.now()}.${extension}`;
        const folderPath = path.join(process.cwd(), "public");
        const filePath = path.join(folderPath, fileName);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const fileStream = fs.createWriteStream(filePath);
        await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", resolve);
        });

        const audioExtensions = ["oga", "ogg", "wav", "mp3"];
        let finalFilePath = filePath;
        let finalExtension = extension;

        if (audioExtensions.includes(extension)) {
            try {
                finalFilePath = await convertAudio(filePath, "mp3");
                finalExtension = "mp3";
            } catch (error) {
                logError(error);
            }
        }

        return {
            fileName: path.basename(finalFilePath),
            fileOldPath: filePath,
            filePath: finalFilePath,
            fileBuffer: fs.readFileSync(finalFilePath),
            extension: finalExtension,
        };
    } catch (error) {
        logError(error);
        throw error;
    }
};

export const downloadFileBaileys = async (ctx) => {
    try {
        const buffer = await downloadMediaMessage(ctx, "buffer");

        const tmpDir = path.join(process.cwd(), "public");
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir);
        }

        const fileName = `file-${Date.now()}.ogg`;
        const filePath = path.join(tmpDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const audioExtensions = ["oga", "ogg", "wav", "mp3"];
        let finalFilePath = filePath;
        let finalExtension = "ogg";

        if (audioExtensions.includes(finalExtension)) {
            try {
                finalFilePath = await convertAudio(filePath, "mp3");
                finalExtension = "mp3";
            } catch (error) {
                logError(error);
            }
        }

        return {
            fileName: path.basename(finalFilePath),
            fileOldPath: filePath,
            filePath: finalFilePath,
            fileBuffer: fs.readFileSync(finalFilePath),
            extension: finalExtension,
        };
    } catch (error) {
        logError(error);
        throw error;
    }
};

export default { downloadFile, downloadFileBaileys };