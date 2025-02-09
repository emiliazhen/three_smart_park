import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/three_smart_park/',
  plugins: [react(), glsl()],
  assetsInclude: ['src/assets/model/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: '@import "@/assets/style/variable.less";',
      },
    },
  },
})
