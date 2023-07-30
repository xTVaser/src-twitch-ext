import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "url";
import { resolve } from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import copy from "rollup-plugin-copy";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  root,
  plugins: [basicSsl(), svelte()],
  resolve: {
    alias: {
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url)
      ),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        copy({
          copyOnce: true,
          targets: [
            {
              src: resolve(
                __dirname,
                "node_modules/@shoelace-style/shoelace/dist/assets"
              ),
              dest: resolve(__dirname, "dist/shoelace"),
            },
          ],
        }),
      ],
      input: {
        appConfig: resolve(root, "config", "index.html"),
        appViewer: resolve(root, "viewer", "index.html"),
      },
    },
  },
});
