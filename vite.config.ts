import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { DATABASE_PATH } = loadEnv(mode, process.cwd(), 'DATABASE_PATH')
  if (DATABASE_PATH) process.env.DATABASE_PATH = DATABASE_PATH
  return { plugins: [tanstackStart(), react(), nitro()] }
})
