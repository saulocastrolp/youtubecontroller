const { google } = require("googleapis");

let activeDevice = "computador"; // Assume que começa no computador

module.exports = async (req, res) => {
    try {
        console.log("📲 [TRANSFER] Transferindo reprodução...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({ access_token: accessToken });

        const youtube = google.youtube({
            version: "v3",
            auth: oauth2Client
        });

        // 🔄 Alterna o dispositivo de reprodução
        activeDevice = activeDevice === "computador" ? "celular" : "computador";

        console.log(`✅ [TRANSFER] Reprodução transferida para: ${activeDevice}`);

        res.json({ message: "📲 Reprodução transferida com sucesso!", device: activeDevice });
    } catch (error) {
        console.error("❌ [TRANSFER] Erro ao transferir reprodução:", error.message);
        res.status(500).json({ error: "Erro ao transferir reprodução.", details: error.message });
    }
};
