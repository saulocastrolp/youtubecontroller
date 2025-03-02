const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [USER] Iniciando request para obter informações do usuário...");

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

        console.log("📡 [USER] Criado OAuth2Client...");

        // PEGAR TOKEN DO COOKIE
        const cookies = req.headers.cookie ? req.headers.cookie.split("; ") : [];
        const tokenCookie = cookies.find(c => c.startsWith("oauth_token="));
        if (!tokenCookie) {
            console.warn("⚠️ [USER] Nenhum token encontrado nos cookies. Usuário não autenticado.");
            return res.status(401).json({ error: "Usuário não autenticado. Faça login." });
        }

        const tokens = JSON.parse(decodeURIComponent(tokenCookie.split("=")[1]));
        oauth2Client.setCredentials(tokens);

        console.log("🔑 [USER] Token OAuth2 recuperado:", tokens);

        // OBTER DADOS DO USUÁRIO
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
