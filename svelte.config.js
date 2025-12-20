import { svelte } from '@sveltejs/vite-plugin-svelte';

export default {
    compilerOptions: {
        dev: true,
        compatibility: { componentApi: 5 }
    },
    plugins: [svelte()]
};