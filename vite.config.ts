import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "/connect_four/",
  server: {
    port: 8080,
  },
});
