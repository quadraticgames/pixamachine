import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Loaded without the VITE_ prefix, so this key is only ever available to the
  // dev server process and is never inlined into the client bundle.
  const { UNSPLASH_ACCESS_KEY } = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      // /api/unsplash/* is forwarded to Unsplash with the access key attached
      // here, on the server. With no key configured the proxy is absent and the
      // app falls back to its built-in sample images.
      proxy: UNSPLASH_ACCESS_KEY
        ? {
            "/api/unsplash": {
              target: "https://api.unsplash.com",
              changeOrigin: true,
              rewrite: (requestPath: string) =>
                requestPath.replace(/^\/api\/unsplash/, ""),
              headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
            },
          }
        : undefined,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
