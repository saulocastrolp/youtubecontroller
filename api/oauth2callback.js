const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("🔍 [OAUTH CALLBACK] Iniciando autenticação...");

        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        const { code } = req.query;
        console.log("📡 [OAUTH CALLBACK] Código de autenticação recebido:", code);

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log("✅ [OAUTH CALLBACK] Tokens obtidos:", tokens);

        // Redireciona para a página principal com o token na URL
        res.redirect(`/?access_token=${tokens.access_token}`);
    } catch (error) {
        console.error("❌ [OAUTH CALLBACK] Erro ao processar autenticação:", error);
        res.status(500).json({ error: "Erro ao processar autenticação." });
    }
};
