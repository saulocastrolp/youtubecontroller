const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("👎 [DISLIKE] Tentando descurtir a música atual...");

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
            id: req.query.videoId,
            rating: "dislike"
        });

        res.json({ message: "👎 Música descurtida com sucesso!", data: response.data });
    } catch (error) {
        console.error("❌ [DISLIKE] Erro ao descurtir a música:", error.message);
        res.status(500).json({ error: "Erro ao descurtir a música.", details: error.message });
    }
};
