const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("⏮️ [PREVIOUS] Tentando voltar para a faixa anterior...");

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

        const videos = response.data.items;
        const currentVideoId = req.query.videoId;

        // 🔍 Encontra a posição da música atual na playlist
        const currentIndex = videos.findIndex(video => video.snippet.resourceId.videoId === currentVideoId);

        if (currentIndex === -1 || currentIndex === 0) {
            return res.json({ message: "⏮️ Nenhuma faixa anterior disponível.", videoId: videos[videos.length - 1].snippet.resourceId.videoId });
        }

        const previousVideo = videos[currentIndex - 1];

        res.json({ message: "⏮️ Faixa anterior tocando!", videoId: previousVideo.snippet.resourceId.videoId });
    } catch (error) {
        console.error("❌ [PREVIOUS] Erro ao tentar voltar para a faixa anterior:", error.message);
        res.status(500).json({ error: "Erro ao tentar voltar para a faixa anterior.", details: error.message });
    }
};
