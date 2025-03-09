const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    console.log("🔍 [USER] Iniciando request para obter informações do usuário...");

    try {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.REDIRECT_URI) {
            console.error("❌ ERRO: Variáveis de ambiente não definidas!");
            return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
        }

        // 🔹 Obtém o token do cabeçalho Authorization
        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            console.warn("⚠️ [USER] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        console.log(`✅ [USER] Token recebido: ${accessToken.substring(0, 6)}... (mascarado para segurança)`);

        // 🔥 Testa se o token é válido antes de usá-lo
        const tokenInfoResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
        const tokenInfo = tokenInfoResponse.data;
        
        if (tokenInfo.error || tokenInfo.expires_in <= 0) {
            console.error("❌ [USER] Token inválido ou expirado:", tokenInfo);
            return res.status(401).json({ error: "Token inválido ou expirado. Faça login novamente." });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        try {
            // 🔹 Obtém informações do usuário autenticado
            const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
            const { data } = await oauth2.userinfo.get();

            console.log("✅ [USER] Dados do usuário obtidos:", data);

            return res.json({
                name: data.name,
                email: data.email,
                picture: data.picture,
            });

        } catch (error) {
            console.error("❌ [USER] Erro ao obter informações do usuário:", error);
            return res.status(500).json({ error: "Erro ao buscar informações do usuário.", details: error.message });
        }
    } catch (error) {
        console.error("❌ [USER] Erro ao processar requisição:", error.message);
        res.status(500).json({ error: "Erro ao processar requisição.", details: error.message });
    }
};
