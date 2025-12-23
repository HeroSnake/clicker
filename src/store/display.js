import { writable } from "svelte/store";

const BREAKPOINT = 768;

function getAspectRatio() {
    if (window.matchMedia("(min-aspect-ratio: 2/1)").matches) {
        return "21:10";
    }

    return "16:9";
}

function createDisplay() {
    const { subscribe, set } = writable({
        device: "desktop",
        aspect: "other"
    });

    if (typeof window !== "undefined") {
        const update = () => {
            set({
                device: window.innerWidth < BREAKPOINT ? "mobile" : "desktop",
                aspect: getAspectRatio()
            });
        };

        update();
        window.addEventListener("resize", update);
    }

    return { subscribe };
}

export const display = createDisplay();
