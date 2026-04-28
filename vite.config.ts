import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "./",
    define: {
      //加载.env文件
      __APP_ENV__: env.APP_ENV,
    },
    server: {
      base: "./",
      host: true,
      open: false,
      hmr: true,
      proxy: {
        "/dev": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev/, ""),
        },
      },
    },
    build: {
      outDir: "dist",
      // esbuild 打包更快，但是不能去除 console.log，去除 console 使用 terser 模式
      minify: "oxc",
      rolldownOptions: {
        output: {
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },

      // minify: "terser",
      // terserOptions: {
      //   compress: {
      //     drop_console: env.ENV === "production" ? true : false,
      //     drop_debugger: true,
      //   },
      // },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    plugins: [react(), tailwindcss(), visualizer()],
    css: {
      modules: {
        localsConvention: "camelCase",
      },
    },
  };
});
