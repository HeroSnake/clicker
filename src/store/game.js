import { writable } from 'svelte/store'
import gameData from "../assets/gameData.json";

const MAX_UPGRADES = 30;
const GOD_MODE = !!+import.meta.env.VITE_GOD_MODE

function createGame() {
    const { subscribe, update, set } = writable({
        itemCount: +localStorage.getItem("itemCount") || 0,
        itemsPerSecond: +localStorage.getItem("itemsPerSecond") || 0,
        totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
        itemsPerClick: +localStorage.getItem("itemsPerClick") || 1,
        upgrades: JSON.parse(localStorage.getItem("upgrades")) ?? structuredClone(gameData)
    }, () => {
        const saveInterval = setInterval(saveData, 2000);
        const generationInterval = setInterval(tickGame, 200);
        return () => {
            clearTimeout(saveInterval)
            clearTimeout(generationInterval)
        }
    });

    const buyUpgrade = id => update(game => {
        let upgrade = game.upgrades.find(u => u.id == id)
        if (game.itemCount >= upgrade.cost) {
            if(upgrade.type == 'cursor') {
                game.itemsPerClick += upgrade.increase
                localStorage.setItem('itemsPerClick', `${game.itemsPerClick}`)
            }
            upgrade.stock++
            game.itemCount -= Math.floor(upgrade.cost)
            upgrade.cost *= 3
            game.upgrades = game.upgrades
            localStorage.setItem('upgrades', JSON.stringify(game.upgrades))
        }

        return game
    })

    const enhanceUpgrade = id => update(game => {
        let upgrade = game.upgrades.find(u => u.id == id)
        if (upgrade.level < MAX_UPGRADES && game.itemCount >= (upgrade.baseCost * Math.exp(upgrade.level))) {
            game.itemCount -= upgrade.baseCost * Math.exp(upgrade.level)
            upgrade.level++
            switch (upgrade.type) {
                default:
                    upgrade.increase *= 2
                    break;
            }
            localStorage.setItem('upgrades', JSON.stringify(game.upgrades))
        }

        return game
    })

    const resetGame = () => update(game => {
        localStorage.removeItem("itemCount");
        localStorage.removeItem("itemsPerSecond");
        localStorage.removeItem("itemsPerClick");
        localStorage.removeItem("totalItemsCollected");
        localStorage.removeItem("upgrades");

        game.itemCount = 0;
        game.itemsPerSecond = 0;
        game.totalItemsCollected = 0;
        game.itemsPerClick = 1;
        game.upgrades = structuredClone(gameData)

        return game
    })

    const saveData = () => update(game => {
        localStorage.setItem("itemCount", `${Math.floor(game.itemCount)}`);
        localStorage.setItem("itemsPerSecond", `${game.itemsPerSecond}`);
        localStorage.setItem("itemsPerClick", `${game.itemsPerClick}`);

        return game
    })

    const clickItem = () => update(game => {
        game.itemCount += game.itemsPerClick

        return game
    })

    const tickGame = () => update(game => {
        let result = 0;
        game.upgrades
            .filter((u) => u.stock >= 1)
            .forEach((u) => {
                switch (u.type) {
                    case "amount":
                    case "cursor":
                        result += u.increase * u.stock;
                        break;
                    case "percent":
                        result +=
                            game.itemsPerSecond *
                            (1 + (u.increase * u.stock) / 100);
                        break;
                }
            });
        game.itemsPerSecond = result;
        game.itemCount += game.itemsPerSecond / 5;
        game.totalItemsCollected += game.itemsPerSecond / 5;

        return game
    })

    return { subscribe , resetGame, enhanceUpgrade, buyUpgrade, clickItem, MAX_UPGRADES, GOD_MODE }
}

export const game = createGame()
