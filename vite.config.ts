import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteSingleFile } from "vite-plugin-singlefile"
import packageJson from "./package.json"

export default defineConfig({
  // השורה הזו קריטית כדי שהדפדפן ידע לחפש נתיבים יחסיים לקובץ עצמו
  base: "./",
  plugins: [react(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  server: {
    proxy: {
      '/api/notamdata': {
        target: 'https://www.notammap.org/notamdata',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notamdata/, '')
      },
      '/api/weather': {
        target: 'https://ims.gov.il/he/aviation_data',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, '')
      }
    }
  }
})