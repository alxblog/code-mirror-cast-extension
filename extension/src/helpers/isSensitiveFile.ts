import * as vscode from 'vscode';

export function isSensitiveFile(filename: string): boolean {
	const config = vscode.workspace.getConfiguration("codeMirrorCast");
	const patterns = config.get<string[]>("excludeFiles", []);

	return patterns.some((pattern) => new RegExp(pattern).test(filename));
}