const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [STATUS] Iniciando request para obter status...");

    try {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        console.log("📡 [STATUS] Criado OAuth2Client...");

        const youtube = google.youtube({ version: "v3", auth: oauth2Client });
        const response = await youtube.activities.list({
            part: "snippet,contentDetails",
            mine: true,
            maxResults: 1,
        });

        if (!response.data || response.data.items.length === 0) {
            console.warn("⚠️ [STATUS] Nenhuma reprodução encontrada.");
            return res.json({ message: "Nenhuma reprodução encontrada." });
        }

        const video = response.data.items[0].snippet;
        console.log("✅ [STATUS] Dados obtidos:", video);

        res.json({
            title: video.title,
            channel: video.channelTitle,
            videoId: response.data.items[0].contentDetails.upload?.videoId || null,
        });
    } catch (error) {
        console.error("❌ [STATUS] Erro ao buscar informações do status:", error.message, error.stack);
        res.status(500).json({ error: "Erro ao buscar status da reprodução.", details: error.message });
    }
};