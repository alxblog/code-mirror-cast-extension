import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as path from 'path';
import * as fs from 'fs';

export function startInternalServer(port: number = 3333) {
  const clients = new Set<WebSocket>();

  // Serveur HTTP basique
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url!;
    const filePath = path.join(__dirname, '..', '..', 'client-dist', urlPath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found :( ');
      }

      // Détermine un type mime minimal
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
      };

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  // Serveur WebSocket lié à HTTP
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  return {
    start: () =>
      server.listen(port, () => {
        console.log(`[CodeMirrorCast] 🧩 Serveur intégré lancé sur http://localhost:${port}`);
      }),

    broadcast: (message: string) => {
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    },

    stop: () => {
      server.close();
      clients.forEach((ws) => ws.close());
      clients.clear();
    },
  };
}
