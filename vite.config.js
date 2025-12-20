import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte()],
    base: "./",
    server: {
        host: '0.0.0.0', // allow LAN access
        strictPort: true,
        port: 5173
    }
});