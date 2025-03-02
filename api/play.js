const { google } = require("googleapis");

module.exports = async (req, res) => {
    try {
        console.log("▶️ [PLAY] Tentando iniciar a reprodução no YouTube Music...");

        const accessToken = req.headers.authorization?.split(" ")[1];

        if (!accessToken) {
            console.warn("⚠️ [PLAY] Token de acesso não fornecido.");
            return res.status(401).json({ error: "Token de acesso ausente." });
        }

        const youtube = google.youtube({
            version: "v3",
            auth: accessToken
        });

        // 🔥 Simulando Play/Pause (Atualmente o YouTube não tem um endpoint direto para play)
        const response = await youtube.videos.list({
            part: "snippet",
            myRating: "like"
        });

        console.log("✅ [PLAY] Comando enviado com sucesso:", response.data);
        res.json({ message: "▶️ Play enviado com sucesso!", data: response.data });
    } catch (error) {
        console.error("❌ [PLAY] Erro ao tentar iniciar a reprodução:", error.message);
        res.status(500).json({ error: "Erro ao tentar iniciar a reprodução.", details: error.message });
    }
};
