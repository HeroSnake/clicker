import { writable } from 'svelte/store'
import themes from "./assets/themes.json";
import gameData from "./assets/gameData.json";

function createGame() {

    let itemCount = +localStorage.getItem("itemCount") || 0;
    let itemsPerSecond = +localStorage.getItem("itemsPerSecond") || 0;
    let totalItemsCollected = +localStorage.getItem("totalItemsCollected") || 0;
    let itemsPerClick = +localStorage.getItem("itemsPerClick") || 1;
    let theme = themes.find(t => t.id == +localStorage.getItem("theme")) || themes[0];
    let clickedCookie = false;
    let cursors = [];


    let upgrades = JSON.parse(localStorage.getItem("upgrades")) ?? [...gameData]

    const { subscribe, update, set } = writable({

    });



    function resetGame() {
        localStorage.removeItem("itemCount");
        localStorage.removeItem("itemsPerSecond");
        localStorage.removeItem("itemsPerClick");
        localStorage.removeItem("totalItemsCollected");
        localStorage.removeItem("upgrades");
        upgrades = [...gameData]
        upgrades = upgrades
        itemsPerClick = 1;
        itemCount = itemsPerSecond = 0;
    }

    function saveData() {
        localStorage.setItem("itemCount", "" + Math.floor(itemCount));
        localStorage.setItem("itemsPerSecond", "" + itemsPerSecond);
        localStorage.setItem("itemsPerClick", "" + itemsPerClick);
    }

    return { subscribe , resetGame, saveData }
}

export const game = createGame
