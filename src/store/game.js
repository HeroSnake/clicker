import { writable } from "svelte/store";
import upgrades from "../assets/upgrades.json";

const GOD_MODE = import.meta.env.DEV ?? !!+import.meta.env.VITE_GOD_MODE;

const TICK_RATE = 200;
const SAVE_RATE = 2000;
const ENHANCE_BONUS = 0.01; // +1% per level (Cookie Clicker style)
const CURSOR_CLICK_MULT = 1; // multiplier for itemsPerClick from cursor upgrades

function createGame() {
    const { subscribe, update } = writable(initGame(), startLoops);

    /* ---------------- INIT ---------------- */

    function initGame() {
        return {
            itemCount: +localStorage.getItem("itemCount") || 0,
            itemsPerSecond: 0,
            totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
            itemsPerClick: +localStorage.getItem("itemsPerClick") || 1,
            upgrades: mergeUpgrades()
        };
    }

    function startLoops() {
        const saveInterval = setInterval(saveData, SAVE_RATE);
        const tickInterval = setInterval(tickGame, TICK_RATE);
        return () => {
            clearInterval(saveInterval);
            clearInterval(tickInterval);
        };
    }

    function mergeUpgrades() {
        const saved = JSON.parse(localStorage.getItem("upgrades")) || [];
        return upgrades.map(u => {
            const s = saved.find(su => su.id === u.id);
            return {
                ...u,
                stock: s?.stock ?? 0,
                level: s?.level ?? 0
            };
        });
    }

    /* ---------------- CORE MATH ---------------- */

    function enhancementMultiplier(u) {
        return 1 + u.level * ENHANCE_BONUS;
    }

    function baseProduction(u) {
        return u.increase * u.stock;
    }

    function computeProduction(game) {
        let base = 0;
        let percentMultiplier = 1;

        for (const u of game.upgrades) {
            if (u.stock <= 0) continue;

            const enhance = enhancementMultiplier(u);

            switch (u.type) {
                case "amount":
                    base += baseProduction(u) * enhance;
                    break;

                case "cursor":
                    base += baseProduction(u) * enhance;
                    break;

                case "percent":
                    percentMultiplier += (u.increase * u.stock * enhance) / 100;
                    break;
            }
        }

        return base * percentMultiplier;
    }

    /* ---------------- ACTIONS ---------------- */

    const buyUpgrade = (id, cost, amount = 1) =>
        update(game => {
            const u = game.upgrades.find(x => x.id === id);
            if (!u) return game;
            if (!GOD_MODE && game.itemCount < cost) return game;

            game.itemCount -= Math.floor(cost);
            u.stock += amount;

            // Boost itemsPerClick for cursor upgrades immediately
            if (u.type === "cursor") {
                game.itemsPerClick += u.increase * CURSOR_CLICK_MULT * amount;
            }

            saveUpgrades(game.upgrades);
            return game;
        });

    const enhanceUpgrade = id =>
        update(game => {
            const u = game.upgrades.find(x => x.id === id);
            if (!u) return game;

            const cost = Math.floor(u.cost * Math.pow(1.5, u.level));
            if (!GOD_MODE && game.itemCount < cost) return game;

            game.itemCount -= cost;
            u.level++;

            // Increase itemsPerClick for cursor upgrades by 1% per level
            if (u.type === "cursor") {
                game.itemsPerClick += u.increase * CURSOR_CLICK_MULT * ENHANCE_BONUS;
            }

            saveUpgrades(game.upgrades);
            return game;
        });

    const clickItem = () =>
        update(game => {
            game.itemCount += game.itemsPerClick;
            game.totalItemsCollected += game.itemsPerClick;
            return game;
        });

    const resetGame = () =>
        update(() => {
            localStorage.clear();
            return initGame();
        });

    /* ---------------- TICK ---------------- */

    const tickGame = () =>
        update(game => {
            const ips = computeProduction(game);

            game.itemsPerSecond = ips;
            const delta = ips / (1000 / TICK_RATE);

            game.itemCount += delta;
            game.totalItemsCollected += delta;

            return game;
        });

    /* ---------------- SAVE ---------------- */

    function saveData() {
        update(game => {
            localStorage.setItem("itemCount", Math.floor(game.itemCount).toString());
            localStorage.setItem("itemsPerClick", game.itemsPerClick.toString());
            localStorage.setItem("totalItemsCollected", game.totalItemsCollected.toString());
            saveUpgrades(game.upgrades);
            return game;
        });
    }

    function saveUpgrades(upgrades) {
        localStorage.setItem(
            "upgrades",
            JSON.stringify(
                upgrades.map(u => ({
                    id: u.id,
                    stock: u.stock,
                    level: u.level
                }))
            )
        );
    }

    return {
        subscribe,
        buyUpgrade,
        enhanceUpgrade,
        clickItem,
        resetGame,
        GOD_MODE
    };
}

export const game = createGame();
