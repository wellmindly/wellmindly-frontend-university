import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // 5174 belongs to frontend-counselor, which the backend hardcodes as the
    // counselor portal's setup-profile host (routes/v1/admin.ts, contacts.ts).
    // Both repos used to declare 5174 with no strictPort, so whichever started
    // second silently moved to the next free port and an instruction to "open
    // localhost:5174" could serve the wrong product. strictPort makes a clash
    // fail on boot instead of relocating quietly. 5175 is frontend-auraflow.
    port: 5176,
    strictPort: true,
  },
})
