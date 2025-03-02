const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

module.exports = (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/youtube",
            "https://www.googleapis.com/auth/youtube.force-ssl",
        ],
    });
    res.redirect(authUrl);
};


const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [LOGIN] Redirecionando para autenticação do Google...");

    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
        console.error("❌ ERRO: Variáveis de ambiente não definidas!");
        return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    // 🔥 Definição correta dos escopos necessários
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",  // Para obter a identidade do usuário
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.force-ssl",
        "https://www.googleapis.com/auth/youtube"
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline", // Necessário para refresh token
        scope: scopes,
        prompt: "consent"  // Força o usuário a conceder permissão novamente
    });

    console.log("🔗 [LOGIN] URL de autenticação gerada:", url);
    res.redirect(url);
};
