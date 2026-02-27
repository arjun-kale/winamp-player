export type WinampRPCSchema = {
	bun: {
		requests: Record<string, never>;
		messages: {
			resizeWindow: { width: number; height: number };
			closeWindow: void;
			minimizeWindow: void;
			maximizeWindow: void;
			showContextMenu: void;
		};
	};
	webview: {
		requests: Record<string, never>;
		messages: {
			contextMenuAction: { action: string };
		};
	};
};
