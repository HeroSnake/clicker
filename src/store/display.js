import { writable } from "svelte/store";

const BREAKPOINT = 768;

function createDisplay() {
    const { subscribe, set } = writable("desktop");

    function update() {
        set(window.innerWidth < BREAKPOINT ? "phone" : "desktop");
    }

    return {
        subscribe,
        init() {
            update();
            window.addEventListener("resize", update);
        },
        destroy() {
            window.removeEventListener("resize", update);
        }
    };
}

export const displayMode = createDisplay();
