import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
const staticPaths = new Set(["/help", "/privacy", "/terms", "/licenses"]);
function cleanPages(): Plugin {
  const middleware: import("vite").Connect.NextHandleFunction = (
    req,
    _res,
    next,
  ) => {
    const [path, query] = (req.url || "").split("?");
    const clean = path.replace(/\/$/, "");
    if (staticPaths.has(clean))
      req.url = clean + ".html" + (query ? "?" + query : "");
    next();
  };
  return {
    name: "clean-static-pages",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const verification = env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || "";
  const escape = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return {
    plugins: [
      react(),
      cleanPages(),
      {
        name: "optional-google-verification",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            return html.replace(
              /<meta\s+name=["']google-site-verification["']\s+content=["']%VITE_GOOGLE_SITE_VERIFICATION%["']\s*\/?>/g,
              verification
                ? '<meta name="google-site-verification" content="' +
                    escape(verification) +
                    '">'
                : "",
            );
          },
        },
      },
    ],
    build: {
      rolldownOptions: {
        input: Object.fromEntries(
          ["index", "help", "privacy", "terms", "licenses"].map((name) => [
            name,
            resolve(process.cwd(), name + ".html"),
          ]),
        ),
      },
    },
    test: { include: ["tests/unit/**/*.test.ts"] },
  };
});
