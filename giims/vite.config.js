import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('lucide-react')) {
                            return 'icons';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
    server: {
        host: '0.0.0.0',
        origin: 'http://192.168.1.31:5173',
        hmr: {
            host: '192.168.1.31',
        },
        cors: true,
    },
});
