import { writable } from 'svelte/store'
import themes from "../assets/themes.json";

function createTheme() {
    const { subscribe, update, set } = writable({
        ...(themes.find(t => t.id == +localStorage.getItem("theme")) || themes[0])
    })

    const chooseTheme = idTheme => {
        localStorage.setItem("theme", `${idTheme}`)
        set(themes.find(t => t.id == idTheme))
    }

    return { subscribe, chooseTheme }
}

export const theme = createTheme()
