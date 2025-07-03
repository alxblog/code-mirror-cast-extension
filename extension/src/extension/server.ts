import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as path from "path";
import * as fs from "fs";
import { ServerStatus, updateStatusBar } from "./statusBar";

export function initInternalServer(port: number = 3333) {
	const clients = new Set<WebSocket>();
	let started = false;

	// Serveur HTTP basique
	const server = createServer((req: IncomingMessage, res: ServerResponse) => {
		const urlPath = req.url === "/" ? "/index.html" : req.url!;
		const filePath = path.join(__dirname, "..", "public", urlPath);
		console.log("filePath", filePath)
		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				return res.end("404 Not Found :( ");
			}

			// Détermine un type mime minimal
			const ext = path.extname(filePath).toLowerCase();
			const mimeTypes: Record<string, string> = {
				".html": "text/html",
				".js": "application/javascript",
				".css": "text/css",
				".json": "application/json",
				".svg": "image/svg+xml",
			};

			res.writeHead(200, {
				"Content-Type": mimeTypes[ext] || "application/octet-stream",
			});
			res.end(data);
		});
	});

	server
		.on("listening", () => {
			console.log("CodeMirror : Server started");
			updateStatusBar(ServerStatus.Started);
		})
		.on("close", () => {
			updateStatusBar(ServerStatus.Stopped);
			console.log("CodeMirror : Server stopped");
		});

	// Serveur WebSocket lié à HTTP
	const wss = new WebSocketServer({ server });

	wss.on("connection", (ws) => {
		clients.add(ws);
		ws.on("close", () => clients.delete(ws));
	});

	const isStarted = (): boolean => started;

	return {
		server,
		start: () => {
			server.listen(port, () => {
				started = true;
				console.log(
					`[CodeMirrorCast] 🧩 Serveur intégré lancé sur http://localhost:${port}`
				);
			});
		},
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
			started = false;
		},
		isStarted,
	};
}
