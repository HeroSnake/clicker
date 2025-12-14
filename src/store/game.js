import { writable } from 'svelte/store';
import gameData from "../assets/gameData.json";

const GOD_MODE = import.meta.env.DEV ?? !!+import.meta.env.VITE_GOD_MODE;

function createGame() {
    const { subscribe, update, set } = writable({
        itemCount: +localStorage.getItem("itemCount") || 0,
        itemsPerSecond: +localStorage.getItem("itemsPerSecond") || 0,
        totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
        itemsPerClick: +localStorage.getItem("itemsPerClick") || 1,
        upgrades: mergeUpgrades()
    }, () => {
        const saveInterval = setInterval(saveData, 2000);
        const generationInterval = setInterval(tickGame, 200);
        return () => {
            clearInterval(saveInterval);
            clearInterval(generationInterval);
        }
    });

    // Merge saved upgrades with full gameData
    function mergeUpgrades() {
        const saved = JSON.parse(localStorage.getItem("upgrades")) || [];
        return gameData.map(u => {
            const s = saved.find(su => su.id === u.id);
            if (s) return { ...u, stock: s.stock, level: s.level }; // keep original increase untouched
            return { ...u };
        });
    }

    // Compute effective increase dynamically based on level
    function getEffectiveIncrease(upgrade) {
        switch (upgrade.type) {
            case "cursor":
            case "amount":
                return upgrade.increase * Math.pow(1.5, upgrade.level);
            default:
                return upgrade.increase;
        }
    }

    const buyUpgrade = (id, cost, multiple = 1) => update(game => {
        const upgrade = game.upgrades.find(u => u.id === id);
        if (!upgrade) return game;
        if (game.itemCount < cost) return game;

        if (upgrade.type === "amount") {
            game.itemsPerSecond += getEffectiveIncrease(upgrade) * multiple;
        }

        if (upgrade.type === "cursor") {
            game.itemsPerClick += getEffectiveIncrease(upgrade) * multiple;
        }

        upgrade.stock += multiple;
        game.itemCount -= Math.floor(cost);

        saveUpgrades(game.upgrades);
        return game;
    });

    const enhanceUpgrade = id => update(game => {
        const upgrade = game.upgrades.find(u => u.id == id);
        if (!upgrade) return game;

        const enhancementCost = Math.floor(upgrade.cost * Math.pow(1.5, upgrade.level));

        if (game.itemCount >= enhancementCost) {
            game.itemCount -= enhancementCost;
            upgrade.level++; // store only level, bonus computed dynamically
            saveUpgrades(game.upgrades);
        }
        return game;
    });

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
        game.upgrades = structuredClone(gameData);

        return game;
    });

    const saveData = () => update(game => {
        localStorage.setItem("itemCount", `${Math.floor(game.itemCount)}`);
        localStorage.setItem("itemsPerSecond", `${game.itemsPerSecond}`);
        localStorage.setItem("itemsPerClick", `${game.itemsPerClick}`);
        saveUpgrades(game.upgrades);
        return game;
    });

    // Save only minimal info: id, stock, level
    function saveUpgrades(upgrades) {
        const minimal = upgrades.map(u => ({
            id: u.id,
            stock: u.stock,
            level: u.level
        }));
        localStorage.setItem("upgrades", JSON.stringify(minimal));
    }

    const clickItem = () => update(game => {
        game.itemCount += game.itemsPerClick;
        return game;
    });

    const tickGame = () => update(game => {
        let result = 0;
        game.upgrades
            .filter(u => u.stock >= 1)
            .forEach(u => {
                const eff = getEffectiveIncrease(u);
                switch (u.type) {
                    case "amount":
                    case "cursor":
                        result += eff * u.stock;
                        break;
                }
            });
        game.itemsPerSecond = result;
        game.itemCount += game.itemsPerSecond / 5;
        game.totalItemsCollected += game.itemsPerSecond / 5;

        return game;
    });

    return { subscribe, resetGame, enhanceUpgrade, buyUpgrade, clickItem, GOD_MODE, getEffectiveIncrease };
}

export const game = createGame();
