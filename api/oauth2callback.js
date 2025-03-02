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

        // 🔥 Verifica se o token tem os escopos corretos antes de redirecionar
        const tokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${tokens.access_token}`)
            .then(response => response.json());

        if (!tokenInfo.scope.includes("https://www.googleapis.com/auth/userinfo.profile")) {
            console.error("❌ O escopo do token é inválido. Revogando acesso...");
            return res.status(403).json({ error: "Escopo inválido. Revogue o acesso e tente novamente." });
        }

        // Redireciona para a página inicial com o token na URL
        res.redirect(`/?access_token=${tokens.access_token}`);
    } catch (error) {
        console.error("❌ [OAUTH CALLBACK] Erro ao processar autenticação:", error);
        res.status(500).json({ error: "Erro ao processar autenticação." });
    }
};
