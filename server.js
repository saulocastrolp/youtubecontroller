const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// 📌 API Home
app.get("/", (req, res) => {
    res.send("YouTube & YouTube Music Connect API rodando 🚀");
});

// 🔹 Autenticação OAuth2
app.get("/api/login", (req, res) => {
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
app.get("/api/oauth2callback", async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send("Autenticação realizada com sucesso! Você pode fechar esta janela.");
});

// 🔹 Obtém o status da reprodução atual
app.get("/api/status", async (req, res) => {
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
        res.json({
            title: video.title,
            channel: video.channelTitle,
            videoId: response.data.items[0].contentDetails.upload?.videoId || null,
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar status da reprodução." });
    }
});

// 🔹 Transferir reprodução entre dispositivos
app.post("/api/transfer", async (req, res) => {
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

// 🔹 Controles de Reprodução (Simulados)
app.post("/api/play", (req, res) => res.json({ message: "▶️ Play (Simulado)" }));
app.post("/api/pause", (req, res) => res.json({ message: "⏸️ Pause (Simulado)" }));
app.post("/api/next", (req, res) => res.json({ message: "⏭️ Próxima (Simulado)" }));
app.post("/api/previous", (req, res) => res.json({ message: "⏮️ Anterior (Simulado)" }));
app.post("/api/like", (req, res) => res.json({ message: "❤️ Curtido (Simulado)" }));
app.post("/api/dislike", (req, res) => res.json({ message: "👎 Não Curtido (Simulado)" }));
app.post("/api/shuffle", (req, res) => res.json({ message: "🔀 Shuffle Ativado (Simulado)" }));
app.post("/api/repeat", (req, res) => res.json({ message: "🔁 Repeat Ativado (Simulado)" }));

// 📌 Vercel precisa que exportemos o app como uma API
module.exports = app;
