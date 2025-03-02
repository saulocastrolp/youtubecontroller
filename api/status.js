const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [STATUS] Iniciando request para obter status...");

    try {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        // 🔹 Obtém o token do cabeçalho Authorization
        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            console.warn("⚠️ [STATUS] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente. Faça login novamente." });
        }

        console.log("✅ [STATUS] Token recebido:", accessToken);

        // 🔹 Define o token de acesso antes de chamar a API do YouTube
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        console.log("📡 [STATUS] Criado OAuth2Client com token...");

        const youtube = google.youtube({ version: "v3", auth: oauth2Client });

        // 🔹 Faz a requisição autenticada à API do YouTube
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
        console.error("❌ [STATUS] Erro ao buscar informações do status:", error.message);
        res.status(500).json({ error: "Erro ao buscar status da reprodução.", details: error.message });
    }
};
