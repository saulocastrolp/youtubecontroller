const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

// 📌 A Vercel define a porta automaticamente, então NÃO precisamos definir manualmente
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Armazena o status da música/vídeo e o dispositivo atual
let currentTrack = {};
let currentDevice = null;

// 📌 Ajustamos as URLs para serem compatíveis com a Vercel
app.get("/", (req, res) => {
    res.send("YouTube & YouTube Music Connect API rodando 🚀");
});

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

// 🔹 Obtém a música/vídeo sincronizado
app.get("/sync", (req, res) => {
    res.json({ currentTrack, currentDevice });
});

// 🔹 Transferir reprodução
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

// 🔹 Controles de Reprodução (simulados, pois a API do YouTube não permite controle direto)
app.post("/play", (req, res) => res.json({ message: "▶️ Play (Simulado)" }));
app.post("/pause", (req, res) => res.json({ message: "⏸️ Pause (Simulado)" }));
app.post("/next", (req, res) => res.json({ message: "⏭️ Próxima (Simulado)" }));
app.post("/previous", (req, res) => res.json({ message: "⏮️ Anterior (Simulado)" }));
app.post("/like", (req, res) => res.json({ message: "❤️ Curtido (Simulado)" }));
app.post("/dislike", (req, res) => res.json({ message: "👎 Não Curtido (Simulado)" }));
app.post("/shuffle", (req, res) => res.json({ message: "🔀 Shuffle Ativado (Simulado)" }));
app.post("/repeat", (req, res) => res.json({ message: "🔁 Repeat Ativado (Simulado)" }));

// 📌 Vercel não usa `app.listen(PORT)`, então exportamos a API
module.exports = app;
