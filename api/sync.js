const axios = require("axios");
const { google } = require("googleapis");

let activeDevice = null; // Guarda o dispositivo que está tocando

module.exports = async (req, res) => {
    try {
        console.log("🔄 [SYNC] Sincronizando reprodução...");

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

        // 🔥 Obtém a música atual que está tocando no dispositivo ativo
        const response = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: "HL", // Playlist de curtidas
            maxResults: 1
        });

        if (response.data.items.length === 0) {
            return res.status(404).json({ error: "Nenhuma música tocando." });
        }

        const video = response.data.items[0].snippet;

        // 🔄 Atualiza o dispositivo ativo
        activeDevice = req.query.device || activeDevice;
        console.log(`✅ [SYNC] Reprodução ativa no dispositivo: ${activeDevice}`);

        res.json({ message: "🔄 Sincronização concluída!", device: activeDevice, videoId: video.resourceId.videoId });
    } catch (error) {
        console.error("❌ [SYNC] Erro ao sincronizar reprodução:", error.message);
        res.status(500).json({ error: "Erro ao sincronizar reprodução.", details: error.message });
    }
};
