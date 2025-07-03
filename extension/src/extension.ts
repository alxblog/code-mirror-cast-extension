import * as vscode from "vscode";
import { initInternalServer } from "./extension/server";
import { isSensitiveFile } from "./helpers/isSensitiveFile";
import { getFrontendUrl } from "./helpers/getFrontendUrl";
import {
	createStatusBarItem,
	updateStatusBar,
	ServerStatus,
} from "./extension/statusBar";
import { toggleServer } from "./extension/commands/toggleServer";

let interval: NodeJS.Timeout | null = null;
let lastPayload: string | null = null;
let previewServer: ReturnType<typeof initInternalServer> | null = null;

const openFrontend = async (context: vscode.ExtensionContext) => {
	const url = await getFrontendUrl(context);
	await vscode.env.openExternal(url);
};

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("🟢 CodeMirrorCast Active");

	const autoStart = false;
	const openBrowserAtStart = false;

	createStatusBarItem();

	previewServer = initInternalServer();
	// 🔌 Démarre le serveur intégré
	const { commands } = vscode;
	const { registerCommand } = commands;
	const commandsToRegister = {
		toggleServer: async () => {
			toggleServer(previewServer?.isStarted() ?? false);
		},
		start: () => {
			previewServer && previewServer.start();
			openBrowserAtStart && openFrontend(context);
			startSyncLoop();
			vscode.window.showInformationMessage(
				"🟢 CodeMirrorCast server started !"
			);
		},
		stop: () => {
			stopSyncLoop();
			previewServer?.stop();
		},
		openFrontend: () => openFrontend(context),
		showSettings: () => {
			vscode.commands.executeCommand(
				"workbench.action.openSettings",
				"@ext:alexandre.code-mirror-cast"
			);
		},
		statusBarMenu: async () => {
			const selection = await vscode.window.showQuickPick(
				[
					{ label: `$(play) Start Server`, action: "start" },
					{ label: "$(debug-stop) Stop Server", action: "stop" },
					{ label: "$(text-size) Set Font Size", action: "setFontSize" },
					{ label: `$(eye-closed) Blur Content Temporarily`, action: "blur" },
					{ label: `$(window) Open mirror page`, action: "openFrontend" },
					{ label: `$(settings) Show Settings`, action: "showSettings" },
				],
				{
					placeHolder: "Select an action for CodeMirrorCast",
				}
			);

			if (!selection) return;

			switch (selection.action) {
				case "start":
					await vscode.commands.executeCommand("codeMirrorCast.start");
					break;
				case "stop":
					await vscode.commands.executeCommand("codeMirrorCast.stop");
					break;
				case "openFrontend":
					await vscode.commands.executeCommand("codeMirrorCast.openFrontend");
					break;
				case "setFontSize":
					const fontSizeInput = await vscode.window.showInputBox({
						prompt: "Enter font size (px)",
						value: Number(
							vscode.workspace.getConfiguration("codeMirrorCast").get("fontSize", 16)
						).toString(),
						placeHolder: "Font size in pixels",
						// ignoreFocusOut: true,
						// Validate input to ensure it's a number
						validateInput: (value) =>
							isNaN(Number(value)) ? "Must be a number" : undefined,
					});
					if (fontSizeInput) {
						const fontSize = Number(fontSizeInput);
						vscode.workspace
							.getConfiguration()
							.update(
								"codeMirrorCast.fontSize",
								fontSize,
								vscode.ConfigurationTarget.Global
							);
					}
					break;
				case "showSettings":
					vscode.commands.executeCommand(
						"workbench.action.openSettings",
						"@ext:alexandre.code-mirror-cast"
					);
					break;
				case "blur":
					vscode.window.showInformationMessage(
						"🔒 Blur action triggered (not yet implemented)"
					);
					break;
			}
		},
	};
	context.subscriptions.push(
		...Object.entries(commandsToRegister).map(([cmdName, fn]) =>
			registerCommand(`codeMirrorCast.${cmdName}`, fn)
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
