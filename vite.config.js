import react from "@vitejs/plugin-react";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  const outDir = resolve(process.cwd(), "dist");

  return {
    plugins: [
      react(),
      {
        name: "github-pages-spa-fallback",
        apply: "build",
        closeBundle: () =>
          copyFile(resolve(outDir, "index.html"), resolve(outDir, "404.html")),
      },
    ],
    base: command === "build" ? "/relink-job-platform/" : "/",
  };
});
