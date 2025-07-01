import * as vscode from "vscode";
import { ServerStatus, updateStatusBar } from "../statusBar";

export const toggleServer = async (isServerRunning: boolean) => {
			if (isServerRunning) {
				updateStatusBar(ServerStatus.Waiting);
				await vscode.commands.executeCommand("codeMirrorCast.stop");
			} else {
				updateStatusBar(ServerStatus.Waiting);
				const port = await vscode.commands.executeCommand<number>(
					"codeMirrorCast.start"
				);
			}
		}