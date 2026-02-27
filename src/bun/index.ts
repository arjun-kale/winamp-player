import Electrobun, { BrowserWindow, BrowserView, ContextMenu } from "electrobun/bun";
import type { WinampRPCSchema } from "../shared/rpc-types";

let mainWindow: InstanceType<typeof BrowserWindow>;
let winampRpc: ReturnType<typeof BrowserView.defineRPC<WinampRPCSchema>>;

const rpc = BrowserView.defineRPC<WinampRPCSchema>({
	handlers: {
		requests: {},
		messages: {
			resizeWindow: ({ width, height }) => {
				mainWindow.setSize(width, height);
			},
			closeWindow: () => mainWindow.close(),
			minimizeWindow: () => mainWindow.minimize(),
			maximizeWindow: () => {
				if (mainWindow.isMaximized()) {
					mainWindow.unmaximize();
				} else {
					mainWindow.maximize();
				}
			},
			showContextMenu: () => {
				ContextMenu.showContextMenu([
					{ label: "Play / Pause", action: "playPause", accelerator: " " },
					{ label: "Previous Track", action: "prev", accelerator: "Left" },
					{ label: "Next Track", action: "next", accelerator: "Right" },
					{ type: "separator" },
					{ label: "Close", action: "close", accelerator: "q" },
				]);
			},
		},
	},
});
winampRpc = rpc;

Electrobun.events.on("context-menu-clicked", (e: { data?: { action?: string } }) => {
	const action = e?.data?.action;
	if (action) {
		winampRpc.send.contextMenuAction({ action });
	}
});

mainWindow = new BrowserWindow({
	title: "Winamp Player",
	url: "views://mainview/index.html",
	frame: {
		width: 400,
		height: 700,
		x: 200,
		y: 100,
	},
	titleBarStyle: "hidden",
	rpc,
});

console.log("Winamp Player started!");
