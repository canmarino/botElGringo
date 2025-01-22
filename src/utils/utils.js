import fs from 'fs';
import path from 'path';
import { format as formatDate } from 'date-fns';

export const logError = (error) => {
    try {
        const errorDir = path.join('errores');
        if (!fs.existsSync(errorDir)) {
            fs.mkdirSync(errorDir, { recursive: true });
        }

        const date = new Date();
        const formattedDate = formatDate(date, 'MM-dd_HH-mm-ss');
        const errorFilePath = path.join(errorDir, `${formattedDate}_error.txt`);
        const errorMessage = `${formattedDate}: ${error.message}\nStack: ${error.stack}\n\n`;

        fs.appendFileSync(errorFilePath, errorMessage, 'utf-8');
        console.error('Error logged in:', errorFilePath);
    } catch (logError) {
        console.error('Failed to log error:', logError);
    }
};
