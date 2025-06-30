import * as vscode from 'vscode';
import * as http from 'http';

async function isViteRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5173', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

/**
 * Retourne l'URL à ouvrir (Vite en dev, ou fichier local en prod)
 */
export async function getFrontendUrl(context: vscode.ExtensionContext): Promise<vscode.Uri> {
  const vite = await isViteRunning();

  if (vite) {
    return vscode.Uri.parse('http://localhost:5173');
  }

  return vscode.Uri.parse('http://localhost:3333');
}
