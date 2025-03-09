const axios = require("axios");
const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("⏸️ [PAUSE] Tentando pausar a reprodução no YouTube Music...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        res.json({ message: "⏸️ Pause enviado com sucesso! (Simulado)" });
    } catch (error) {
        console.error("❌ [PAUSE] Erro ao tentar pausar a reprodução:", error.message);
        res.status(500).json({ error: "Erro ao tentar pausar a reprodução.", details: error.message });
    }
};
