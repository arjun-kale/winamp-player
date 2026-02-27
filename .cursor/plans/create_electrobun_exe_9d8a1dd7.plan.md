---
name: Create Electrobun EXE
overview: Use your existing Electrobun build scripts to produce a Windows .exe installer. You already have the right scripts; you just need to ensure the frontend is built first and run the correct command.
todos: []
isProject: false
---

# Create Windows EXE for Electrobun App

Per the [Electrobun Bundling & Distribution docs](https://blackboard.sh/electrobun/docs/guides/bundling-and-distribution/), your project is already set up with the right scripts. Here’s how to get an exe for testing.

## Steps to Create the EXE

### 1. Build the frontend first

Your [electrobun.config.ts](p:\Projects\ProjM\electrobun.config.ts) copies from `dist/`, which is produced by Vite. Ensure that folder exists before running the Electrobun build:

```bash
pnpm exec vite build
```

Or, if you have a Vite build script: `pnpm run build` (you’d add this if needed).

### 2. Run the Electrobun build

You already have these scripts in [package.json](p:\Projects\ProjM\package.json):

- `build:canary` — `electrobun build --env=canary`
- `build:stable` — `electrobun build --env=stable`

For quick tests, use:

```bash
pnpm run build:canary
```

### 3. Output location

Electrobun creates an `artifacts` folder at the project root. On Windows you’ll see:

- `canary-win-x64-winampplayer-Setup-canary.zip` — ZIP containing the Setup.exe installer
- `canary-win-x64-winampplayer-canary.tar.zst` — Compressed app bundle

### 4. Test the exe

1. Extract `canary-win-x64-winampplayer-Setup-canary.zip`
2. Run the `Setup.exe` installer inside
3. Install and launch the app

Alternatively, look for an extracted app folder (depending on Electrobun’s build output); that will contain the main `.exe` for direct testing without installing.

---

## Optional improvements

### One-step build script

Combine Vite build and Electrobun build so you don’t have to run them separately:

```json
"build:exe": "vite build && electrobun build --env=canary"
```

Then you can use:

```bash
pnpm run build:exe
```

### `bundleCEF` setting

In [electrobun.config.ts](p:\Projects\ProjM\electrobun.config.ts) you have `bundleCEF: false` for all platforms. That’s fine for testing:

- Uses system **WebView2** (Chromium-based) on Windows
- Smaller bundle (~14MB)
- Depends on the user having WebView2 installed

If you need a fixed Chromium version (e.g. for consistent behavior), set `win: { bundleCEF: true }`. The bundle will be ~100MB, but you won’t depend on the system WebView2 version.

---

## Summary


| Step           | Command                                                  |
| -------------- | -------------------------------------------------------- |
| Build frontend | `pnpm exec vite build`                                   |
| Build exe      | `pnpm run build:canary`                                  |
| Output         | `artifacts/canary-win-x64-winampplayer-Setup-canary.zip` |
| Test           | Extract ZIP and run Setup.exe inside                     |


