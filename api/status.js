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

        // 🔥 Obtém o histórico de vídeos assistidos (tentando pegar o YouTube Music)
        const response = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // Playlist de histórico do usuário
            maxResults: 1
        });

        if (response.data.items.length === 0) {
            return res.json({ title: "Nenhuma música tocando", channel: "" });
        }

        const video = response.data.items[0].snippet;
        const videoId = video.resourceId.videoId;
        const title = video.title;
        const channel = video.channelTitle;

        console.log(`✅ [STATUS] Música atual: ${title} - ${channel}`);

        res.json({ title, channel, videoId });
    } catch (error) {
        console.error("❌ [STATUS] Erro ao buscar status da reprodução:", error.message);
        res.status(500).json({ error: "Erro ao buscar status da reprodução.", details: error.message });
    }
};
