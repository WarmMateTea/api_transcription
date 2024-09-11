import {config} from "dotenv";
config();
import express from "express";
import multer from "multer";
import path from "path";
import cors from 'cors';
import { Transcription } from './transcription.js';
import { fileURLToPath } from 'url';
import { requestToSingleChatSummarizeEndpoint } from "./requests.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cors());

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
    console.log("New Request at ", Date.now());

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

            requestToSingleChatSummarizeEndpoint(result);

            return res.status(200).json({result});
        }).catch((err) => {
            console.error("Error during transcription: ", err);
            return res.status(500).json({message: 'Error during transcription'});
        });
})

// caminho testepra receber o arquivo de áudio + chave
app.post('/api/test_upload', upload.single('file'), (req, res) => {
    console.log("New Request at ", Date.now());

    console.log("Uploaded file: ", req.file);
    
    // TODO: checar tamanho do arquivo; se maior que 25MB, fragmentar (pesquisar como :) )

    const uploadedFile = req.file;
    const filePath = path.join(__dirname, uploadedFile.path);
    console.log("File path to transcribe: ", filePath);

    if (!uploadedFile) {
        return res.status(400).json({message: 'No file uploaded'});
    }

    console.log("WARN: This file (", uploadedFile.path ,") will need to be deleted manually.")
    return res.status(200).json({message: 'Congrats, file received!'});
})

app.post('/api/testrequest', (req, res) => {

    const rawText = req.body['content'];

    requestToSingleChatSummarizeEndpoint(rawText)
        .then((result) => {
            console.log("External request sent!");
            return res.status(200).json({message: 'request sent'}); 
        }).catch((err) => {
            console.error("Error during external request: ", err);
            return res.status(500).json({message: 'Error during external request'});
        });
})

//rotas p/ lidar com arquivos fragmentados
app.post('/api/upload/fragment', upload.single('file'), (req, res) => {
    // fluxo: 
    // receber dado
    // ver se tem a pasta certa
    // se n tiver criar
    // salvar na pasta
    // enviar resposta

    //no úlimo fragmento, aí sim chamar o método de transcrição
    console.log("Fragment uploaded at", Date.now());
})


var fragmentHeadParser = (req, res, next) => {
    const processId = req.headers['process_id'];
    const segmentIndex = req.headers['segment_index'];
    const totalSegments = req.headers['total_segments'];
    const isLastSegment = req.headers['is_last_segment'];

    if (processId == undefined || segmentIndex == undefined || totalSegments == undefined || isLastSegment == undefined) {
        return res.status(400).json({ message: "Custom header malformed. The header should have: process_id, segment_index, total_segments, is_last_segment"});
    }

    next();
};