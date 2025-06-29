// types/index.ts

export interface SyncData {
	filename: string;
	content: string;
	language: string;
	fontSize?: number;
	openedFiles?: string[];
	cursor?: {
		line: number;
		character: number;
	};
}
