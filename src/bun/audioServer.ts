import path from "path";
import { MIME_TYPES } from "../shared/constants";

let allowedPaths: Set<string> = new Set();
let serverPort = 0;

export function setAllowedPaths(paths: string[]): void {
  allowedPaths = new Set(paths.map((p) => path.resolve(p).toLowerCase()));
}

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath).toLowerCase();
  for (const allowed of allowedPaths) {
    if (resolved.startsWith(allowed)) return true;
  }
  return false;
}

export async function startAudioServer(): Promise<number> {
  if (serverPort > 0) return serverPort;

  const server = Bun.serve({
    port: 38473 + Math.floor(Math.random() * 10778),
    hostname: "127.0.0.1",
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname !== "/play") {
        return new Response("Not Found", { status: 404 });
      }

      const pathParam = url.searchParams.get("path");
      if (!pathParam) {
        return new Response("Missing path", { status: 400 });
      }

      let filePath: string;
      try {
        filePath = decodeURIComponent(pathParam);
      } catch {
        return new Response("Invalid path", { status: 400 });
      }

      if (!isPathAllowed(filePath)) {
        return new Response("Forbidden", { status: 403 });
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

      try {
        const file = Bun.file(filePath);
        if (!(await file.exists())) {
          return new Response("Not Found", { status: 404 });
        }

        const size = file.size;
        return new Response(file.stream(), {
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(size),
            "Accept-Ranges": "bytes",
          },
        });
      } catch {
        return new Response("Internal Server Error", { status: 500 });
      }
    },
  });

  serverPort = server.port;
  return serverPort;
}

export function getAudioServerPort(): number {
  return serverPort;
}
