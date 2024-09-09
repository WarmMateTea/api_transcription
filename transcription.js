import fs from "fs";
import OpenAi from "openai";
import { config } from 'dotenv';
config()
const openai = new OpenAi();


async function Transcription(filePath) {
    try {
        const fileStream = fs.createReadStream(filePath);

        console.log("Sending transcription request to OpenAI API...");

        const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
            language: 'pt',
        });
    
        console.log("Transcription complete.");
        console.log("Transcrição: " + transcription.text);

        return transcription.text;
    } catch (err) {
        console.error("Error in transcription: ", err);
        throw(err);
    } finally {
       console.log("Trying to remove file ", filePath) 
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`File ${filePath} deleted successfully.`);
            }
        });
    }
}

export { Transcription }