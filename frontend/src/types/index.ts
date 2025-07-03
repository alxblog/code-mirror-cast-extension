// types/index.ts

export interface SyncData {
	filename: string;
	content: string;
	language: string;
	fontSize?: number;
	isSensitive?: boolean;
	openedFiles?: string[];
	cursor?: {
		line: number;
		character: number;
	};
}
