const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { google } = require("googleapis");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const REDIRECT_URI = "https://youtubeconnect.app.br/api/oauth2callback"; // 🔥 Corrigido para local

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    REDIRECT_URI
);

let currentTrack = { videoId: null };
let currentDevice = "computador";

app.use(express.static(path.join(__dirname, "public")));

// 📌 Importar dinamicamente todas as rotas da pasta `/api`
const fs = require("fs");
const apiDir = path.join(__dirname, "api");

fs.readdirSync(apiDir).forEach((file) => {
    if (file.endsWith(".js")) {
        const route = `/api/${file.replace(".js", "")}`;
        const handler = require(path.join(apiDir, file));

        if (typeof handler === "function") {
            app.use(route, handler);
            console.log(`✅ Rota carregada: ${route}`);
        }
    }
});

// 📌 Inicia o servidor localmente
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
