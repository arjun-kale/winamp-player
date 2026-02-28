# Winamp Player – Electrobun & React Demo

A Winamp-inspired music player app built with [Electrobun](https://github.com/blackboardsh/electrobun), React, and Tailwind CSS.

<img width="1200" height="800" alt="image" src="https://github.com/user-attachments/assets/f7a4a154-22f3-42f5-a5d2-4cb6a757b13c" />
<img width="380" height="400" alt="image" src="https://github.com/user-attachments/assets/bb101a64-4364-44b5-86d6-36de6e93f636" />


## Features

- 🎵 **Cross-platform desktop UI** with a nostalgic Winamp look
- ⚡️ **React + Vite + Tailwind** for hot-reload frontend development
- 🍰 **Electrobun**: Lightning-fast Bun-based desktop framework
- 🩳 **Separation of concerns**: Bun main process + web-based renderer

## Quickstart

1. **Install dependencies**  
   ```bash
   bun install
   ```

2. **Start in development mode**  
   ```bash
   bun run dev
   ```

3. **Build for production**  
   ```bash
   bun run start
   ```

> Build output lands in `dist/`, and static assets are copied to the main view for Electron-style delivery.

## Customization & Ideas

Ready to keep going? Try these:

- Implement tracklist & playback using React hooks
- Add file open dialogs to import music (via Bun)
- Add system tray support and native menus
- Connect Bun <-> React via IPC for enhanced interactivity

## Resources

- [Electrobun Docs](https://docs.electrobun.dev/)
- [Electrobun Examples](https://github.com/blackboardsh/electrobun/tree/main/playground)
- [Electrobun GitHub](https://github.com/blackboardsh/electrobun)
- [Vite](https://vitejs.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)

---

Happy hacking! 🦄
