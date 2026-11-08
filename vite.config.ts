// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // или ваш фреймворк

export default defineConfig({
  base: '/SlimeCastleCardGenerator/', // ИМЯ ВАШЕГО РЕПОЗИТОРИЯ С КОСЫМИ ЧЕРТАМИ
  plugins: [react()],
})