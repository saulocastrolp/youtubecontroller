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
        console.log("🔍 [TOKEN RECUPERADO] O token recuperado foi: " + accessToken);

        if (!accessToken) {
            console.warn("⚠️ [USER] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        console.log(`✅ [USER] Token recebido: ${accessToken.substring(0, 6)}... (mascarado para segurança)`);

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        try {
            // 🔹 Obtém informações do usuário autenticado
            const { data } = await oauth2Client.userinfo.get();

            console.log("✅ [USER] Dados do usuário obtidos:", data);

            return res.json({
                name: data.name,
                email: data.email,
                picture: data.picture,
            });

        } catch (error) {
            console.error("❌ [USER] Token inválido ou expirado: Token recuperado: " + accessToken, error.message, );

            // 🔹 Tenta renovar o token se houver um refresh_token disponível
            if (error.message.includes("invalid_grant") || error.message.includes("credentials")) {
                console.log("🔄 Tentando renovar o token de acesso...");

                try {
                    const { tokens } = await oauth2Client.refreshAccessToken();
                    oauth2Client.setCredentials(tokens);

                    console.log("✅ Token renovado com sucesso!");

                    // Obtém os dados do usuário novamente com o novo token
                    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
                    const { data } = await oauth2.userinfo.get();

                    return res.json({
                        name: data.name,
                        email: data.email,
                        picture: data.picture,
                        new_access_token: tokens.access_token, // Envia novo token para o front-end
                    });
                } catch (refreshError) {
                    console.error("❌ Erro ao renovar o token:", refreshError.message);
                    return res.status(401).json({ error: "Token expirado. Faça login novamente." });
                }
            }

            return res.status(401).json({ error: "Token inválido ou expirado. Faça login novamente. Token recuperado: " + accessToken });
        }
    } catch (error) {
        console.error("❌ [USER] Erro ao buscar informações do usuário:", error.message);
        res.status(500).json({ error: "Erro ao buscar informações do usuário.Token recuperado: " + accessToken, details: error.message });
    }
};
