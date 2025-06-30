import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem | undefined;
let serverRunning = false;
let port = 3333; // Port par défaut

export function createStatusBarItem(): vscode.StatusBarItem {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'codeMirrorCast.toggleServer';
  }

  updateStatusBar();
  statusBarItem.show();
  return statusBarItem;
}

export function setServerRunning(running: boolean, customPort: number = port) {
  serverRunning = running;
  if (customPort) port = customPort;
  updateStatusBar();
}

function updateStatusBar() {
  if (!statusBarItem) return;
  if (serverRunning) {
    statusBarItem.text = `$(server) CodeMirror ON : ${port}`;
    statusBarItem.tooltip = 'Clique pour arrêter le serveur';
  } else {
    statusBarItem.text = '$(debug-disconnect) CodeMirror OFF';
    statusBarItem.tooltip = 'Clique pour démarrer le serveur';
  }
}
