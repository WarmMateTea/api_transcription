import {config} from "dotenv";
config();
import express from "express";
import multer from "multer";
import path from "path";
import { Transcription } from './transcription.js';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

const port = process.env.TOKEN_SERVER_PORT;

app.listen(port, () => {
    console.log(`API server running on ${port}...`);
});


// func p/ multer salvar no armazenamento local temporariamente
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({storage: storage});

// verificação da chave de api estática
var checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: "Invalid API Key"})
    }

    next();
};

app.all('/api/*', checkApiKey);

// caminho pra receber o arquivo de áudio + chave
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log("Uploaded file: ", req.file);
    
    // TODO: checar tamanho do arquivo; se maior que 25MB, fragmentar (pesquisar como :) )

    const uploadedFile = req.file;
    const filePath = path.join(__dirname, uploadedFile.path);
    console.log("File path to transcribe: ", filePath);

    if (!uploadedFile) {
        return res.status(400).json({message: 'No file uploaded'});
    }

    Transcription(filePath)
        .then((result) => {
            console.log("Transcription success!");
            return res.status(200).json({result});
        }).catch((err) => {
            console.error("Error during transcription: ", err);
            return res.status(500).json({message: 'Error during transcription'});
        });
})