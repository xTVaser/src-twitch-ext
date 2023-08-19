import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "url";
import { resolve } from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { normalizePath } from "vite";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            resolve(
              __dirname,
              "node_modules/@shoelace-style/shoelace/dist/assets/",
            ),
          ),
          dest: "/dist/shoelace/",
        },
      ],
    }),
    basicSsl(),
    svelte(),
  ],
  resolve: {
    alias: {
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      plugins: [],
      input: {
        appConfig: resolve(root, "config", "index.html"),
        appViewer: resolve(root, "viewer", "index.html"),
      },
    },
  },
});
