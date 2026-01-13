import { mount } from 'svelte';
import App from './App.svelte';
import { isUpToDate, migrate } from './migrations/migrator';

if (!isUpToDate()) {
    migrate();
}

const app = mount(App, { target: document.getElementById("app") });

export default app;