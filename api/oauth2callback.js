const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        console.log("✅ [AUTH] Token OAuth2 recebido:", tokens);

        // Salvar o token em um cookie HTTP-only para segurança
        res.setHeader("Set-Cookie", `oauth_token=${JSON.stringify(tokens)}; Path=/; HttpOnly; Secure; SameSite=Strict`);

        res.redirect("/"); // Redirecionar de volta para a página principal
    } catch (error) {
        console.error("❌ [AUTH] Erro ao processar autenticação:", error.message);
        res.status(500).json({ error: "Erro ao processar autenticação." });
    }
};