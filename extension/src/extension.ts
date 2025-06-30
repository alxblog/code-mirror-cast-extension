import * as vscode from "vscode";
import { startInternalServer } from "./extension/server";
import { isSensitiveFile } from "./helpers/isSensitiveFile";
import { getFrontendUrl } from "./helpers/getFrontendUrl";

let interval: NodeJS.Timeout | null = null;
let lastPayload: string | null = null;
let previewServer: ReturnType<typeof startInternalServer> | null = null;

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("🟢 CodeMirrorCast Sync Active");

	previewServer = startInternalServer();
	previewServer.start(); // 🔌 Démarre le serveur intégré

	context.subscriptions.push(
    vscode.commands.registerCommand('codeMirrorCast.openFrontend', async () => {
      const url = await getFrontendUrl(context);
      await vscode.env.openExternal(url);
    })
  );

	startSyncLoop();

	context.subscriptions.push({
		dispose() {
			stopSyncLoop();
			previewServer?.stop();
		},
	});
}



function startSyncLoop() {
	if (interval) return;

	interval = setInterval(() => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const document = editor.document;
		const content = document.getText();
		const filename = document.fileName;
		const language = document.languageId;
		const cursor = editor.selection.active;

		const config = vscode.workspace.getConfiguration("codeMirrorCast");
		const fontSize = config.get<number>("fontSize", 16);
		const openedFiles = vscode.workspace.textDocuments
			.filter((doc) => doc.uri.scheme === "file")
			.map((doc) => doc.fileName);
		const isSensitive = isSensitiveFile(filename);

		const payload = {
			filename,
			content,
			language,
			fontSize,
			isSensitive,
			openedFiles,
			cursor: {
				line: cursor.line,
				character: cursor.character,
			},
		};

		const payloadString = JSON.stringify(payload);

		if (payloadString !== lastPayload) {
			lastPayload = payloadString;
			console.log("[EXT] Envoi vers client intégré");
			previewServer?.broadcast(payloadString); // 🚀 Envoi via le serveur WebSocket
		}
	}, 300);
}

function stopSyncLoop() {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

export function deactivate() {
	stopSyncLoop();
	previewServer?.stop();
}
