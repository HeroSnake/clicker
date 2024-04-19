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

    const chooseTheme = idTheme => CHOOSABLE_THEME && changeTheme(idTheme)

    function changeTheme(idTheme) {
        localStorage.setItem("theme", `${idTheme}`)
        const theme = themes.find(t => t.id == idTheme)
        changeMetas(theme)
        set(theme)
    }

    function changeMetas(theme) {
        let link = document.querySelector("link[rel='icon']");
        link.href = `./public/img/items/${theme.img}`;

        document.title = `${theme.name} clicker`
    }

    return { subscribe, chooseTheme, CHOOSABLE_THEME }
}

export const theme = createTheme()
