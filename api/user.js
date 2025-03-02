const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        // Criamos um cliente OAuth2
        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        // Definimos as credenciais do usuário a partir do token armazenado na sessão
        const tokens = req.cookies ? req.cookies.tokens : null;
        if (!tokens) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        oauth2Client.setCredentials(JSON.parse(tokens));

        // Obtemos informações do usuário autenticado
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        res.json({
            name: data.name,
            email: data.email,
            picture: data.picture,
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar informações do usuário" });
    }
};