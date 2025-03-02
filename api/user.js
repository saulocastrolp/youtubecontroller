const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [USER] Iniciando request para obter informações do usuário...");

    try {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            console.warn("⚠️ [USER] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        console.log("✅ [USER] Token recebido:", accessToken);

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        console.log("✅ [USER] Dados do usuário obtidos:", data);

        res.json({
            name: data.name,
            email: data.email,
            picture: data.picture,
        });
    } catch (error) {
        console.error("❌ [USER] Erro ao buscar informações do usuário:", error.message);
        res.status(500).json({ error: "Erro ao buscar informações do usuário.", details: error.message });
    }
};
