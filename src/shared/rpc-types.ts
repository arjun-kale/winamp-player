export type WinampRPCSchema = {
	bun: {
		requests: Record<string, never>;
		messages: {
			resizeWindow: { width: number; height: number };
			closeWindow: void;
			minimizeWindow: void;
			maximizeWindow: void;
		};
	};
	webview: {
		requests: Record<string, never>;
		messages: Record<string, never>;
	};
};
