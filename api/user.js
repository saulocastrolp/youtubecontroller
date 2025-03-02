const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 Iniciando request para obter usuário...");

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        console.log("📡 Criado OAuth2Client...");

        const tokens = req.cookies ? req.cookies.tokens : null;
        if (!tokens) {
            console.log("⚠️ Usuário não autenticado. Tokens não encontrados.");
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        oauth2Client.setCredentials(JSON.parse(tokens));

        console.log("🔑 Tokens definidos. Buscando informações do usuário...");

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        console.log("✅ Dados do usuário obtidos:", data);

        res.json({
            name: data.name,
            email: data.email,
            picture: data.picture,
        });
    } catch (error) {
        console.error("❌ Erro ao buscar informações do usuário:", error);
        res.status(500).json({ error: "Erro ao buscar informações do usuário" });
    }
};