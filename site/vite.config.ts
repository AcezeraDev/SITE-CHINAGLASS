import fs from "node:fs"
import path from "node:path"
import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/** Só no `npm run dev`: a página /exportar-ar.html grava aqui os modelos 3D convertidos para a realidade aumentada */
function salvarModelosAR(): Plugin {
  return {
    name: "salvar-modelos-ar",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__salvar-modelo", (req, res) => {
        const nome = new URL(req.url ?? "", "http://local").searchParams.get("nome") ?? ""
        if (req.method !== "POST" || !/^[a-z0-9-]+$/.test(nome)) {
          res.statusCode = 400
          res.end()
          return
        }
        const partes: Buffer[] = []
        req.on("data", (c: Buffer) => partes.push(c))
        req.on("end", () => {
          const destino = path.resolve(__dirname, "public/modelos", `${nome}.glb`)
          fs.mkdirSync(path.dirname(destino), { recursive: true })
          fs.writeFileSync(destino, Buffer.concat(partes))
          res.end(String(fs.statSync(destino).size))
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), salvarModelosAR()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
