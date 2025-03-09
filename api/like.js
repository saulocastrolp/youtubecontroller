const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("❤️ [LIKE] Tentando curtir a música atual...");

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

        const response = await youtube.videos.rate({
            id: req.query.videoId, // O ID do vídeo deve ser passado na URL
            rating: "like"
        });

        res.json({ message: "❤️ Música curtida com sucesso!", data: response.data });
    } catch (error) {
        console.error("❌ [LIKE] Erro ao curtir a música:", error.message);
        res.status(500).json({ error: "Erro ao curtir a música.", details: error.message });
    }
};
