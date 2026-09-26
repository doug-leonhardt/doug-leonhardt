const http = require("http");
const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

const REPO_ROOT = path.join(__dirname, "..", "..");
const README_PATH = path.join(REPO_ROOT, "README.md");
const CSS_PATH = path.join(
  __dirname,
  "node_modules",
  "github-markdown-css",
  "github-markdown.css",
);
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

function loadCss() {
  try {
    return fs.readFileSync(CSS_PATH, "utf8");
  } catch {
    return "";
  }
}

function renderPage() {
  const source = fs.readFileSync(README_PATH, "utf8");
  const rendered = md.render(source);
  const css = loadCss();
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>README preview</title>
    <style>
      ${css}
      body { box-sizing: border-box; min-width: 200px; margin: 0; padding: 32px; background: #fff; }
      .markdown-body { max-width: 820px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <article class="markdown-body">${rendered}</article>
  </body>
</html>`;
}

const server = http.createServer((req, res) => {
  try {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage());
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Failed to render README: ${err.message}`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`README preview server running at http://localhost:${PORT}`);
});
