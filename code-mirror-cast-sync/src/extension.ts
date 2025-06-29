// extension.ts
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
    
    const config = vscode.workspace.getConfiguration('codeMirrorCast');
    const fontSize = config.get<number>('fontSize', 16); // Valeur par défaut : 16
    const openedFiles = vscode.workspace.textDocuments.map(doc => doc.fileName);

    const payload = {
      filename,
      content,
      language,
      fontSize,
      openedFiles,
      cursor: {
        line: cursor.line,
        character: cursor.character,
      },
      editor,
      // tabGroups,
    };

    const payloadString = JSON.stringify(payload);

    if (payloadString !== lastPayload) {
      lastPayload = payloadString;
      console.log('[EXT] Envoi vers serveur :', payloadString);
      socket.send(payloadString);
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
