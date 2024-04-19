import { writable } from 'svelte/store'
import themes from "../assets/themes.json";

function createTheme() {
    const { subscribe, update, set } = writable({
        ...(themes.find(t => t.id == +localStorage.getItem("theme")) || structuredClone(themes[0]))
    })


    const chooseTheme = idTheme => update(theme => {
        theme = themes.find(t => t.id == idTheme)
        localStorage.setItem("theme", "" + idTheme)

        return theme
    })

    return { subscribe, chooseTheme }
}

export const theme = createTheme()
