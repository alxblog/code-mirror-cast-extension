// sync-server/sync-server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3333;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json()); // tu peux garder ça, utile pour debug

// 📁 Sert les fichiers de sync-client (buildé avec Tailwind via Vite)
const distPath = path.join(__dirname, '../sync-client/dist');
app.use(express.static(distPath));

// 🔁 WebSocket logic
let latestState = null;
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  if (latestState) ws.send(JSON.stringify(latestState));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      latestState = data;
      for (const client of clients) {
        if (client !== ws && client.readyState === 1) {
          client.send(JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('❌ Message invalide', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

app.get('/latest', (req, res) => {
  res.json(
    latestState ?? {
      filename: '',
      content: '',
      language: 'javascript',
      cursor: { line: 0, character: 0 },
    }
  );
});

// 🎯 SPA fallback (navigateur -> React)
app.get('/*', (_, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`✅ Sync server running at http://localhost:${PORT}`);
});
