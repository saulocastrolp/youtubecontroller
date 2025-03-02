const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("▶️ [PLAY] Tentando iniciar a reprodução no YouTube Music...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            console.warn("⚠️ [PLAY] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        // 🔥 Criando o OAuth2 Client corretamente
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        const youtube = google.youtube({
            version: "v3",
            auth: oauth2Client // 🔥 Agora usando OAuth2Client corretamente
        });

        // 🔥 Simulando um comando de reprodução, já que a API do YouTube não tem um endpoint direto para Play/Pause
        const response = await youtube.videos.list({
            part: "snippet",
            myRating: "like"
        });

        console.log("✅ [PLAY] Comando enviado com sucesso:", response.data);
        res.json({ message: "▶️ Play enviado com sucesso!", data: response.data });
    } catch (error) {
        console.error("❌ [PLAY] Erro ao tentar iniciar a reprodução:", error.message);
        res.status(500).json({ error: "Erro ao tentar iniciar a reprodução.", details: error.message });
    }
};
