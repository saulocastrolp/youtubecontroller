const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("🎵 [TRACK] Obtendo a última música reproduzida...");

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

        // 🔥 Obtém a última música do histórico de reprodução
        const response = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // "Histórico de vídeos assistidos" pode não funcionar para todos
            maxResults: 1
        });

        if (response.data.items.length === 0) {
            return res.status(404).json({ error: "Nenhuma música encontrada no histórico." });
        }

        const video = response.data.items[0].snippet;
        const videoId = video.resourceId.videoId;
        const title = video.title;

        console.log(`✅ [TRACK] Última música reproduzida: ${title} (ID: ${videoId})`);

        res.json({ videoId, title });
    } catch (error) {
        console.error("❌ [TRACK] Erro ao buscar a música atual:", error.message);
        res.status(500).json({ error: "Erro ao buscar a música atual.", details: error.message });
    }
};
