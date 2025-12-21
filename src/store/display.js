import { writable } from "svelte/store";

const BREAKPOINT = 768;

function createDisplay() {
    const { subscribe, set } = writable(
        typeof window !== "undefined" && window.innerWidth < BREAKPOINT ? "phone" : "desktop"
    );

    if (typeof window !== "undefined") {
        const update = () => set(window.innerWidth < BREAKPOINT ? "phone" : "desktop");
        window.addEventListener("resize", update);
    }

    return { subscribe };
}

export const displayMode = createDisplay();
