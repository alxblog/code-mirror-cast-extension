import * as vscode from 'vscode';
import WebSocket from 'ws';

let socket: WebSocket | null = null;
let interval: NodeJS.Timeout | null = null;
let lastPayload: string | null = null;

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('🟢 CodeMirrorCast Sync Active');

  connectToWebSocket();

  context.subscriptions.push({
    dispose() {
      stopSyncLoop();
      socket?.close();
    },
  });
}

function connectToWebSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket('ws://localhost:3333');

  socket.on('open', () => {
    console.log('[CodeMirrorCast] ✅ Connected to sync server');
    startSyncLoop();
  });

  socket.on('close', () => {
    console.warn('[CodeMirrorCast] 🔌 Disconnected from sync server. Reconnecting...');
    stopSyncLoop();
    setTimeout(connectToWebSocket, 1000);
  });

  socket.on('error', (err) => {
    console.error('[CodeMirrorCast] ❌ WebSocket error:', err);
  });
}



function startSyncLoop() {
  if (interval) return;

  interval = setInterval(() => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !socket || socket.readyState !== WebSocket.OPEN) return;

    const document = editor.document;
    const content = document.getText();
    const filename = document.fileName;
    const language = document.languageId;
    const cursor = editor.selection.active;

    const payload = {
      filename,
      content,
      language,
      cursor: {
        line: cursor.line,
        character: cursor.character,
      },
    };

    const payloadString = JSON.stringify(payload);

    if (payloadString !== lastPayload) {
      lastPayload = payloadString;
      console.log('[EXT] Envoi vers serveur :', payloadString);
      socket.send(payloadString);
    } else {
      // console.log('[EXT] Contenu inchangé, envoi ignoré');
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
  socket?.close();
}
