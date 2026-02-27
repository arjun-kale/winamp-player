import { BrowserWindow, BrowserView } from "electrobun/bun";
import type { WinampRPCSchema } from "../shared/rpc-types";

let mainWindow: InstanceType<typeof BrowserWindow>;

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
		},
	},
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
