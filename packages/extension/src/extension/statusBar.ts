import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem | undefined;
let serverRunning = false;
let port = 3333; // Port par défaut

export enum ServerStatus {
	Waiting = "waiting",
	Started = "started",
	Stopped = "stopped",
	Error = "error",
}

export function createStatusBarItem(): vscode.StatusBarItem {
	if (!statusBarItem) {
		statusBarItem = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			100
		);
		statusBarItem.command = "codeMirrorCast.toggleServer";
	}

	updateStatusBar(ServerStatus.Stopped);
	statusBarItem.show();
	return statusBarItem;
}


export function updateStatusBar(status: ServerStatus): void {
  if (!statusBarItem) throw new Error(`Unhandled status: ${status}`);
	switch (status) {
		case ServerStatus.Waiting:
			console.log("Server : waiting...");
			statusBarItem.text = `$(server) Waiting... : ${port}`;
			statusBarItem.tooltip = "Clique pour arrêter le serveur";
			break;
		case ServerStatus.Started:
			// console.log("Server has started.");
      statusBarItem.text = `$(server) Server Started : ${port}`;
			statusBarItem.tooltip = "Clique pour arrêter le serveur";
			break;
		case ServerStatus.Stopped:
			// console.log("Server is stopped.");
       statusBarItem.text = `$(server) Server Stopped : ${port}`;
			statusBarItem.tooltip = "Clique pour demarrer le serveur";
			break;
		case ServerStatus.Error:
			// console.error("An error occurred.");
      statusBarItem.text = `$(server) ERROR : ${port}`;
			statusBarItem.tooltip = "ERROR";
			break;
		default:
			const _exhaustiveCheck: never = status;
			throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
	}
}
