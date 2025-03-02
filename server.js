const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Armazena o status da música/vídeo e o dispositivo atual
let currentTrack = {};
let currentDevice = null; // "pc" ou "mobile"

// 🔹 Autenticação OAuth2
app.get("/login", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtube.force-ssl",
        ],
    });
    res.redirect(authUrl);
});

// 🔹 Callback OAuth2
app.get("/oauth2callback", async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send("Autenticação realizada com sucesso! Você pode fechar esta janela.");
});

// 🔹 Obtém o status da reprodução atual
app.get("/status", async (req, res) => {
    try {
        const youtube = google.youtube({ version: "v3", auth: oauth2Client });
        const response = await youtube.activities.list({
            part: "snippet,contentDetails",
            mine: true,
            maxResults: 1,
        });

        if (response.data.items.length === 0) {
            return res.json({ message: "Nenhuma reprodução encontrada." });
        }

        const video = response.data.items[0].snippet;
        currentTrack = {
            title: video.title,
            channel: video.channelTitle,
            videoId: response.data.items[0].contentDetails.upload?.videoId || null,
        };

        res.json(currentTrack);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar status da reprodução." });
    }
});

// 🔹 Sincroniza a reprodução entre dispositivos
app.post("/sync", (req, res) => {
    const { device, track } = req.body;
    currentTrack = track;
    currentDevice = device;
    res.json({ message: `Música sincronizada no ${device}.` });
});

// 🔹 Obtém a música/vídeo sincronizado para reprodução em outro dispositivo
app.get("/sync", (req, res) => {
    res.json({ currentTrack, currentDevice });
});

// 🔹 Transfere a reprodução entre dispositivos
app.post("/transfer", async (req, res) => {
    const { device } = req.body;

    if (!currentTrack.videoId) {
        return res.json({ error: "Nenhuma música/vídeo para transferir." });
    }

    currentDevice = device;

    res.json({
        message: `Reprodução transferida para ${device}.`,
        videoId: currentTrack.videoId,
    });
});

// 🔹 Controles de Reprodução
app.post("/play", async (req, res) => {
    // Simula Play (API do YouTube não permite controle direto)
    res.json({ message: "Reprodução iniciada! (Simulado)" });
});

app.post("/pause", async (req, res) => {
    res.json({ message: "Reprodução pausada! (Simulado)" });
});

app.post("/next", async (req, res) => {
    res.json({ message: "Próxima faixa! (Simulado)" });
});

app.post("/previous", async (req, res) => {
    res.json({ message: "Vídeo anterior! (Simulado)" });
});

// 🔹 Like/Dislike
app.post("/like", async (req, res) => {
    res.json({ message: "Vídeo curtido! (Simulado)" });
});

app.post("/dislike", async (req, res) => {
    res.json({ message: "Vídeo não curtido! (Simulado)" });
});

// 🔹 Ativar/Desativar Shuffle
app.post("/shuffle", async (req, res) => {
    res.json({ message: "Modo Aleatório ativado! (Simulado)" });
});

// 🔹 Ativar/Desativar Repeat
app.post("/repeat", async (req, res) => {
    res.json({ message: "Modo Repetição ativado! (Simulado)" });
});

// 🔹 Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
