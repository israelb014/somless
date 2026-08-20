import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PRODUCTS_SRC = fileURLToPath(new URL('./data/products.json', import.meta.url))

/**
 * המאגר המרכזי חי ב-data/products.json בשורש הריפו (מקור אמת יחיד).
 * הפלאגין מגיש אותו בפיתוח ומעתיק אותו ל-dist/data/products.json בבנייה,
 * כך שהוא נשאר קובץ סטטי שאפשר לאחזר ולקאשר ב-service worker.
 */
function productsData() {
  return {
    name: 'somless-products-data',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0].endsWith('/data/products.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(readFileSync(PRODUCTS_SRC))
          return
        }
        next()
      })
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'data/products.json',
        source: readFileSync(PRODUCTS_SRC, 'utf8'),
      })
    },
  }
}

export default defineConfig({
  // base נקבע בבנייה (‎--base=/somless/‎ ב-GitHub Pages), ברירת מחדל: שורש
  plugins: [react(), productsData()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
