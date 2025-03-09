const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("🎵 [STATUS] Obtendo status da reprodução...");

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

        // 🔥 Obtém a playlist de histórico do usuário (últimos vídeos assistidos)
        const historyResponse = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // "History List" → Playlist que contém os últimos vídeos/músicas assistidos
            maxResults: 1
        });

        if (!historyResponse.data.items || historyResponse.data.items.length === 0) {
            return res.json({ title: "Nenhuma música ou vídeo tocando", channel: "", videoId: null });
        }

        const video = historyResponse.data.items[0].snippet;
        const videoId = historyResponse.data.items[0].snippet.resourceId.videoId;
        const title = video.title;
        const channel = video.channelTitle;

        console.log(`✅ [STATUS] Última reprodução: ${title} - ${channel}`);

        res.json({ title, channel, videoId });
    } catch (error) {
        console.error("❌ [STATUS] Erro ao buscar status da reprodução:", error.message);
        res.status(500).json({ error: "Erro ao buscar status da reprodução.", details: error.message });
    }
};
