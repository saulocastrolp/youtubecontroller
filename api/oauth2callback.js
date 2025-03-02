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

        // Armazena os tokens em cookies para manter a sessão ativa
        res.setHeader("Set-Cookie", `tokens=${JSON.stringify(tokens)}; Path=/; HttpOnly; Secure; SameSite=Strict`);
        res.redirect("/"); // Redireciona para a página inicial
    } catch (error) {
        res.status(500).json({ error: "Erro ao processar autenticação" });
    }
};