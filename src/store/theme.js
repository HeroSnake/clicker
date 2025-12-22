import { writable } from 'svelte/store'
import themes from "../assets/themes.json";

const CHOOSABLE_THEME = import.meta.env.DEV ?? !!import.meta.env.VITE_CHOOSABLE_THEME

function createTheme() {
    const theme = themes.find(t => t.code == (localStorage.getItem("theme") ?? import.meta.env.VITE_DEFAULT_THEME)) || themes[1];
    const { subscribe, update, set } = writable({
        name: '',
        code: '',
        unit: '',
        buildings: [],
        bonuses: [],
    })

    changeTheme(theme.code);
    const chooseTheme = code => CHOOSABLE_THEME && changeTheme(code)

    function changeTheme(code) {
        localStorage.setItem("theme", `${code}`)
        const theme = themes.find(t => t.code == code)
        changeMetas(theme)
        set(theme)
    }

    function changeMetas(theme) {
        let link = document.querySelector("link[rel='icon']");
        if (link instanceof HTMLLinkElement) {
            link.href = `/img/${theme.code}/items/item-sm.png`;
        }

        document.title = `${theme.name} clicker`
    }

    return { subscribe, chooseTheme, CHOOSABLE_THEME }
}

export const theme = createTheme()
