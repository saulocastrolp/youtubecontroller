const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );
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
};
