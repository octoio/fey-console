import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@models": path.resolve(__dirname, "./src/models"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  build: {
    // Increase chunk size warning limit to 1000kb since we've properly split the bundles
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks: {
          // Vendor chunk for React and related libraries
          "react-vendor": ["react", "react-dom"],

          // Ant Design as separate chunk (large UI library)
          antd: ["antd", "@ant-design/icons"],

          // ReactFlow as separate chunk (visual editor)
          reactflow: ["reactflow", "dagre"],

          // Monaco Editor as separate chunk (large code editor)
          monaco: ["@monaco-editor/react"],

          // Emotion styling libraries
          emotion: ["@emotion/react", "@emotion/styled"],

          // State management
          store: ["zustand"],

          // Router if used heavily in future
          router: ["react-router-dom"],
        },
        // Generate separate chunks for dynamic imports
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()
            : "chunk";
          return "assets/js/[name]-[hash].js";
        },
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Additional optimizations
    target: "es2020",
    minify: "esbuild",
    sourcemap: false, // Disable sourcemaps in production for smaller builds
  },
});
