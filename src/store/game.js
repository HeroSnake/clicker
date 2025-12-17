import { get, writable } from "svelte/store";
import upgrades from "../assets/upgrades.json";
import enhancements from "../assets/enhancements.json";
import { theme } from "./theme";

const GOD_MODE = import.meta.env.DEV ?? !!+import.meta.env.VITE_GOD_MODE;

const TICK_RATE = 200;
const SAVE_RATE = 2000;
const ENHANCE_BONUS = 0.01;

function createGame() {
    const currentTheme = get(theme);
    const { subscribe, update } = writable(initGame(), startLoops);

    /* ---------------- INIT ---------------- */

    function initGame() {
        const upgradesState = mergeUpgrades();
        const cursor = upgradesState.find(u => u.type === "cursor");
        const cursorLevel = cursor?.level ?? 1;

        return {
            itemCount: +localStorage.getItem("itemCount") || 0,
            itemsPerSecond: 0,
            totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
            upgrades: upgradesState,
            itemsPerClick: 1 * cursorLevel,
            critChance: 0.01 + (cursorLevel - 1) * 0.01,
            critMultiplier: 2,
            activeBoosts: [],
            enhancements: mergeEnhancements(),
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

    const getUpgrade = upgrade => {
        if (upgrade.id < 3 || upgrade.stock >= 1) {
            return {
                name: currentTheme.upgrades[upgrade.id].name,
                description: currentTheme.upgrades[upgrade.id].description,
            }
        }
        return { name: '???', description: '???' };
    };

    function mergeUpgrades() {
        const saved = JSON.parse(localStorage.getItem("upgrades")) || [];
        return upgrades.map(u => {
            const s = saved.find(su => su.id === u.id);
            return {
                ...u,
                stock: s?.stock ?? u.stock ?? 0,
                level: s?.level ?? u.level ?? 1
            };
        });
    }

    function mergeEnhancements() {
        const saved = JSON.parse(localStorage.getItem("enhancements")) || [];
        return enhancements.map(e => {
            const s = saved.find(se => se.id === e.id);
            return {
                ...e,
                level: s?.level ?? e.level ?? 1,
            };
        });
    }

    /* ---------------- CORE MATH ---------------- */

    function enhancementMultiplier(u) {
        return 1 + (u.level ?? 1) * ENHANCE_BONUS;
    }

    function baseProduction(u) {
        return u.increase * u.stock;
    }

    // central computation for total IPS
    function computeProduction(game) {
        let base = 0;
        let percentMultiplier = 1;

        for (const u of game.upgrades) {
            if (u.stock <= 0) continue;
            const enhance = enhancementMultiplier(u);

            switch (u.type) {
                case "amount":
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

    function getUpgradeStats(upgrade, game) {
        const upgradesList = game?.upgrades ?? [];

        if (upgrade.stock <= 0) return { ips: 0, crit: 0 };
        const enhance = enhancementMultiplier(upgrade);

        let base = 0;
        if (upgrade.type === "amount" || upgrade.type === "cursor") {
            base = baseProduction(upgrade) * enhance;
        }

        const percentMultiplier = upgradesList
            .filter(u => u.type === "percent")
            .reduce((mult, u) => mult + (u.increase * u.stock * enhancementMultiplier(u)) / 100, 1);

        return {
            ips: base * percentMultiplier,
            crit: upgrade.type === "cursor" ? 0.01 + (upgrade.level - 1) * 0.01 : 0
        };
    }

    function updateCursorStats(game) {
        const cursor = game.upgrades.find(u => u.type === "cursor");
        if (!cursor) return;

        const stats = getUpgradeStats(cursor, game);
        game.itemsPerClick = Math.max(1, stats.ips);
        game.critChance = stats.crit;
    }

    function getTotalBoost(game) {
        const now = Date.now();
        game.activeBoosts = game.activeBoosts.filter(b => b.expiresAt > now);
        return game.activeBoosts.reduce((total, b) => total + (b.multiplier - 1), 1);
    }

    function computeEnhancementBonuses(game) {
        const bonuses = { productionBonus: 0, boostPower: 0, boostDuration: 0, spawnChance: 0 };
        for (const e of game.enhancements) {
            bonuses[e.id] += 0.01 * e.level;
        }
        return bonuses;
    }

    function getEnhancementBonus(game, id) {
        if (!game?.enhancements) return 0;

        return game.enhancements
            .filter(e => e.id === id) // string comparison
            .reduce((sum, e) => sum + (e.increase ?? 0) * (e.level ?? 1), 0);
    }

    /* ---------------- ACTIONS ---------------- */

    const buyUpgrade = (id, cost, amount = 1) => update(game => {
        const u = game.upgrades.find(u => u.id === id);
        if (!u) return game;
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= Math.floor(cost);
        u.stock += amount;

        saveUpgrades(game.upgrades);
        return game;
    });

    const enhanceUpgrade = id => update(game => {
        const u = game.upgrades.find(x => x.id === id);
        if (!u) return game;

        const cost = Math.floor(u.cost * Math.pow(1.5, u.level));
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= cost;
        u.level++;

        if (u.type === "cursor") updateCursorStats(game);
        saveUpgrades(game.upgrades);
        return game;
    });

    const buyEnhancement = id => update(game => {
        const e = game.enhancements.find(x => x.id === id);
        if (!e) return game;

        const cost = Math.floor(e.cost * Math.pow(1.6, e.level));
        if (!GOD_MODE && (game.itemCount < cost)) return game;

        game.itemCount -= cost;
        e.level++;

        localStorage.setItem("enhancements", JSON.stringify(
            game.enhancements.map(e => ({ id: e.id, level: e.level }))
        ));
        return game;
    });

    const resetGame = () => update(() => {
        localStorage.clear();
        return initGame();
    });

    const clickItem = () => {
        let critResult = { clickValue: 0, isCrit: false };
        update(gameState => {
            const baseClick = gameState.itemsPerClick;
            const isCrit = Math.random() < gameState.critChance;
            const clickValue = isCrit ? baseClick * gameState.critMultiplier : baseClick;

            gameState.itemCount += clickValue;
            gameState.totalItemsCollected += clickValue;

            critResult = { clickValue, isCrit };
            return gameState;
        });
        return critResult;
    };

    const boostProduction = (baseMultiplier, baseDuration) => update(game => {
        const bonuses = computeEnhancementBonuses(game);
        const powerBonus = 1 + bonuses.boostPower / 100;
        const durationBonus = 1 + bonuses.boostDuration / 100;

        game.activeBoosts.push({
            multiplier: baseMultiplier * powerBonus,
            expiresAt: Date.now() + baseDuration * durationBonus
        });

        return game;
    });

    /* ---------------- TICK ---------------- */

    const tickGame = () => update(game => {
        const bonuses = computeEnhancementBonuses(game);
        const permanentBonus = 1 + (bonuses.productionBonus || 0);
        const boostMultiplier = getTotalBoost(game);

        game.itemsPerSecond = computeProduction(game) * permanentBonus * boostMultiplier;
        game.itemCount += game.itemsPerSecond / (1000 / TICK_RATE);
        game.totalItemsCollected += game.itemsPerSecond / (1000 / TICK_RATE);

        updateCursorStats(game);
        return game;
    });

    /* ---------------- SAVE ---------------- */

    function saveData() {
        update(game => {
            localStorage.setItem("itemCount", Math.floor(game.itemCount).toString());
            localStorage.setItem("totalItemsCollected", game.totalItemsCollected.toString());
            saveUpgrades(game.upgrades);
            return game;
        });
    }

    function saveUpgrades(upgrades) {
        localStorage.setItem("upgrades", JSON.stringify(
            upgrades.map(u => ({ id: u.id, stock: u.stock, level: u.level }))
        ));
    }

    return {
        subscribe,
        getUpgrade,
        buyUpgrade,
        enhanceUpgrade,
        clickItem,
        resetGame,
        boostProduction,
        buyEnhancement,
        getEnhancementBonus,
        getUpgradeStats,
        GOD_MODE
    };
}

export const game = createGame();
