import path from "path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // optimizeDeps: {
  //   include: ["@tabler/icons-react"]
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app")
    }
  }
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('@tabler/icons-react')) {
  //           return 'tabler-icons';
  //         }
  //       },
  //     },
  //   },
  // },
});
