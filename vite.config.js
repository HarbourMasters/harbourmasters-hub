import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-i18n': ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
                    'vendor-markdown': ['react-markdown'],
                    'vendor-zip': ['jszip'],
                },
            },
        },
    },
});
