const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("🔁 [REPEAT] Ativando modo repetição...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        const videoId = req.query.videoId;
        if (!videoId) {
            return res.status(400).json({ error: "ID do vídeo ausente." });
        }

        res.json({ message: "🔁 Modo repetição ativado!", videoId });
    } catch (error) {
        console.error("❌ [REPEAT] Erro ao ativar repetição:", error.message);
        res.status(500).json({ error: "Erro ao ativar repetição.", details: error.message });
    }
};