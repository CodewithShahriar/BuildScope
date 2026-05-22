import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// The Cloudflare plugin builds from the Vite pipeline, so wrangler.jsonc main alone is insufficient.
export default defineConfig(({ command, mode }) => {
  const isVercel = process.env.VERCEL === "1" || mode === "vercel";

  return {
    plugins: [
      tsConfigPaths(),
      tanstackStart({
        server: { entry: "server" },
        spa: isVercel ? { enabled: true } : undefined,
      }),
      viteReact(),
      tailwindcss(),
      command === "build" && !isVercel ? cloudflare() : undefined,
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: false,
    },
    esbuild: {
      drop: command === "build" ? ["console", "debugger"] : [],
    },
  };
});
