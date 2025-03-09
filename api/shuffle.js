const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("🔀 [SHUFFLE] Ativando modo aleatório...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        const youtube = google.youtube({
            version: "v3",
            auth: oauth2Client
        });

        // 🔥 Obtém a lista de músicas curtidas do usuário
        const response = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // Playlist de vídeos curtidos
            maxResults: 50
        });

        if (response.data.items.length === 0) {
            return res.status(404).json({ error: "Nenhuma música encontrada." });
        }

        // 🔀 Embaralha a lista de vídeos
        const shuffledVideos = response.data.items.sort(() => Math.random() - 0.5);
        const randomVideo = shuffledVideos[0];

        res.json({ message: "🔀 Modo aleatório ativado!", videoId: randomVideo.snippet.resourceId.videoId });
    } catch (error) {
        console.error("❌ [SHUFFLE] Erro ao ativar modo aleatório:", error.message);
        res.status(500).json({ error: "Erro ao ativar modo aleatório.", details: error.message });
    }
};
