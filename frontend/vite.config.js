import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// PR Review app only. Use port 5190 to avoid conflict with other dev servers (e.g. Risk Engine on 5173).
// API proxy forwards /api to backend at 3010.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5190,
        strictPort: false,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3010',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
