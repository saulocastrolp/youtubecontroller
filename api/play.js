const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("▶️ [PLAY] Tentando reproduzir a última música curtida...");

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

        // 🔥 Buscamos a última música tocada antes de tentar reproduzir
        const trackResponse = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // Playlist de vídeos curtidos
            maxResults: 1
        });

        if (trackResponse.data.items.length === 0) {
            return res.status(404).json({ error: "Nenhuma música encontrada." });
        }

        const video = trackResponse.data.items[0].snippet;
        res.json({ message: "▶️ Música tocando!", videoId: video.resourceId.videoId, title: video.title });
    } catch (error) {
        console.error("❌ [PLAY] Erro ao tentar reproduzir:", error.message);
        res.status(500).json({ error: "Erro ao tentar reproduzir.", details: error.message });
    }
};
