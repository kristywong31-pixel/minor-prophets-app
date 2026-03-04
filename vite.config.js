import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果你係 deploy 去 GitHub Pages，記得加下面呢句 base 設定
  // 如果係 Vercel，通常唔洗加呢句 base
  // base: '/你的-repo-名/', 
})
