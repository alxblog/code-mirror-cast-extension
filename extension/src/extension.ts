import * as vscode from "vscode";
import { initInternalServer } from "./extension/server";
import { isSensitiveFile } from "./helpers/isSensitiveFile";
import { getFrontendUrl } from "./helpers/getFrontendUrl";
import { createStatusBarItem, setServerRunning } from "./extension/statusBar";

let interval: NodeJS.Timeout | null = null;
let lastPayload: string | null = null;
let previewServer: ReturnType<typeof initInternalServer> | null = null;
let isServerRunning: boolean = false;

const openFrontend = async (context: vscode.ExtensionContext) => {
	const url = await getFrontendUrl(context);
	await vscode.env.openExternal(url);
};

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("🟢 CodeMirrorCast Active");

	const autoStart = false;
	const openBrowserAtStart = true;

	createStatusBarItem();

	previewServer = initInternalServer();
	// 🔌 Démarre le serveur intégré

	context.subscriptions.push(
		vscode.commands.registerCommand('codeMirrorCast.toggleServer', async () => {
      if (isServerRunning) {
        await vscode.commands.executeCommand('codeMirrorCast.stop');
        setServerRunning(false);
      } else {
        const port = await vscode.commands.executeCommand<number>('codeMirrorCast.start');
        setServerRunning(true, port ?? 3333);
      }
    }),
		vscode.commands.registerCommand("codeMirrorCast.start", () => {
			previewServer && previewServer.start();
			isServerRunning = true
			openBrowserAtStart && openFrontend(context);
			startSyncLoop();
			vscode.window.showInformationMessage("🟢 CodeMirrorCast server started");
		}),
		vscode.commands.registerCommand("codeMirrorCast.stop", () => {
			stopSyncLoop();
			previewServer?.stop();
			isServerRunning = false

		}),
		vscode.commands.registerCommand("codeMirrorCast.openFrontend", () =>
			openFrontend(context)
		)
	);


	if (autoStart) {
		previewServer && previewServer.start();
		openBrowserAtStart && openFrontend(context);
		startSyncLoop();
	}

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
