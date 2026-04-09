import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const port = 4173;
const root = resolve(".");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function sendFile(response, filePath) {
  const ext = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const filePath = resolve(join(root, safePath));

    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      const indexPath = join(filePath, "index.html");
      if (existsSync(indexPath)) {
        sendFile(response, indexPath);
        return;
      }
    }

    sendFile(response, filePath);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
  }
});

server.listen(port, () => {
  console.log(`BloomMeal is running at http://localhost:${port}`);
});
