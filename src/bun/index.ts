import { BrowserWindow } from "electrobun/bun";

const mainWindow = new BrowserWindow({
	title: "Winamp Player",
	url: "views://mainview/index.html",
	frame: {
		width: 400,
		height: 700,
		x: 200,
		y: 100,
	},
});

console.log("Winamp Player started!");
