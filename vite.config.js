import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 下面這一行非常重要，這是為了讓 GitHub Pages 找到正確的路徑
  base: '/minor-prophets-app/',
})
