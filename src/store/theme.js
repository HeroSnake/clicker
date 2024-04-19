import { writable } from 'svelte/store'
import themes from "../assets/themes.json";

const CHOOSABLE_THEME = (!!+import.meta.env.VITE_CHOOSABLE_THEME) ?? true

function createTheme() {
    const theme = themes.find(t => t.id == +localStorage.getItem("theme"))
        || themes.find(t => t.code === import.meta.env.VITE_DEFAULT_THEME)
        || themes[0]
    const { subscribe, update, set } = writable({
        ...theme,
    })

    const chooseTheme = idTheme => {
        if (CHOOSABLE_THEME) {
            localStorage.setItem("theme", `${idTheme}`)
            set(themes.find(t => t.id == idTheme))
        }
    }

    return { subscribe, chooseTheme, CHOOSABLE_THEME }
}

export const theme = createTheme()
