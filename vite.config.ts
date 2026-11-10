import { copyFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages отдаёт 404.html на глубокие ссылки, поэтому копируем в него SPA.
function spaFallback(): Plugin {
  let outDir = ''

  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyFile(join(outDir, 'index.html'), join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  base: '/SlimeCastleCardGenerator/', // ИМЯ ВАШЕГО РЕПОЗИТОРИЯ С КОСЫМИ ЧЕРТАМИ
  plugins: [react(), spaFallback()],
  server: {
    watch: {
      // Paint.NET держит эти файлы заблокированными во время сохранения,
      // и из-за них watcher Vite падает с EBUSY.
      ignored: ['**/*.pdnSave'],
    },
  },
})
