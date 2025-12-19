import { get, writable } from "svelte/store";
import upgrades from "../assets/upgrades.json";
import bonuses from "../assets/bonuses.json";
import { theme } from "./theme";

const GOD_MODE = import.meta.env.DEV ?? !!+import.meta.env.VITE_GOD_MODE;

const TICK_RATE = 200;
const SAVE_RATE = 2000;

function createGame() {
    const { subscribe, update } = writable(initGame(), startLoops);

    /* ---------------- INIT ---------------- */

    function initGame() {
        const upgrades = mergeUpgrades();

        return {
            itemCount: +localStorage.getItem("itemCount") || 0,
            production: 0,
            itemsPerClick: 0,
            totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
            upgrades: upgrades,
            activeBoosts: [],
            bonuses: mergeBonuses(),
            productionBonus: 0,
            goldenItemBoostPower: 0,
            goldenItemBoostDuration: 0,
            goldenItemSpawnChance: 0,
            crit: {},
            isProductionBoosted: false,
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
        const currentTheme = get(theme);

        return upgrades.map(u => {
            const s = saved.find(su => su.id === u.id);
            return {
                ...u,
                name: currentTheme.upgrades[u.id].name,
                description: currentTheme.upgrades[u.id].description,
                stock: s?.stock ?? u.stock,
                level: s?.level ?? u.level
            };
        });
    }

    function mergeBonuses() {
        const saved = JSON.parse(localStorage.getItem("bonuses")) || [];
        return bonuses.map(bonus => {
            const s = saved.find(s => s.id === bonus.id);
            return {
                ...bonus,
                level: s?.level ?? bonus.level,
            };
        });
    }

    /* ---------------- CORE MATH ---------------- */

    function getProduction(upgrade, base = false) {
        if (upgrade.stock <= 0 && !base) return 0;

        const stock = base ? 1 : upgrade.stock;

        let levelMult = 1;
        if (upgrade.level > 1) {
            levelMult = Math.pow(2, upgrade.level - 1);
        }

        return upgrade.production * levelMult * stock;
    }

    function getCrit(upgrade) {
        let chance = 0;
        let bonus = 0;
        let multiplier = 0;

        if (upgrade.type === "cursor") {
            chance = upgrade.crit.chance + (upgrade.level - 1) * upgrade.crit.bonus,
            bonus = upgrade.crit.bonus
            multiplier = upgrade.crit.multiplier
        }
        return {
            chance,
            bonus,
            multiplier,
        };
    }

    function getBoost(game) {
        const now = Date.now();

        game.activeBoosts = game.activeBoosts.filter(b => b.expiresAt > now);
        game.isProductionBoosted = game.activeBoosts.length > 0;

        return game.activeBoosts.reduce((total, b) => total + (b.multiplier - 1), 1);
    }

    function getBonuses(game) {
        let bonuses = {};

        game.bonuses.forEach(b => {
            if (b.level == 1) {
                bonuses[b.id] = 0;
            } else {
                bonuses[b.id] = b.increase * (b.level - 1);
            }
        });

        return bonuses;
    }

    // COMPUTE ITEMS PER CLICK
    function getItemsPerClick(cursor) {
        let levelMult = 1;

        if (cursor.level > 1) {
            levelMult = Math.pow(2, cursor.level - 1);
        }

        return 1 * levelMult;
    }

    // COMPUTE PRODUCTION
    function getTotalProduction(game) {
        let production = 0;

        for (const u of game.upgrades) {
            production = production + getProduction(u);
        }

        return production;
    }

    /* ---------------- ACTIONS ---------------- */

    const buyUpgrade = (id, cost, amount = 1) => update(game => {
        const u = game.upgrades.find(u => u.id === id);
        if (!u || (!GOD_MODE && game.itemCount < cost)) return game;

        game.itemCount -= Math.floor(cost);
        u.stock += amount;

        saveUpgrades(game.upgrades);
        return game;
    });

    const buyEnhancement = id => update(game => {
        const u = game.upgrades.find(x => x.id === id);
        if (!u) return game;

        const cost = Math.floor(u.cost * Math.pow(1.5, u.level));
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= cost;
        u.level++;

        saveUpgrades(game.upgrades);
        return game;
    });

    const buyBonus = id => update(game => {
        const e = game.bonuses.find(b => b.id === id);
        if (!e) return game;

        const cost = Math.floor(e.cost * Math.pow(1.6, e.level));
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= cost;
        e.level++;

        saveBonuses(game.bonuses);
        return game;
    });

    const resetGame = () => update(() => {
        localStorage.clear();
        return initGame();
    });

    const clickItem = () => {
        let critResult = { clickValue: 0, isCrit: false };
        update(game => {
            const baseClick = game.itemsPerClick;
            const isCrit = Math.random() < game.crit.chance;
            const clickValue = isCrit ? baseClick * game.crit.multiplier : baseClick;

            game.itemCount += clickValue;
            game.totalItemsCollected += clickValue;

            critResult = { clickValue, isCrit };
            return game;
        });
        return critResult;
    };

    const boostProduction = () => update(game => {
        game.activeBoosts.push({
            multiplier: 5 * (1 + game.goldenItemBoostPower),
            expiresAt: Date.now() + 5000 * (1 + game.goldenItemBoostDuration)
        });

        return game;
    });

    /* ---------------- TICK ---------------- */

    const tickGame = () => update(game => {
        const bonuses = getBonuses(game);
        const boostMultiplier = getBoost(game);

        game.productionBonus = bonuses.productionBonus;
        game.goldenItemBoostPower = bonuses.goldenItemBoostPower;
        game.goldenItemBoostDuration = bonuses.goldenItemBoostDuration;
        game.goldenItemSpawnChance = 0.01 + bonuses.goldenItemSpawnChance;

        game.production = getTotalProduction(game) * (1 + game.productionBonus) * boostMultiplier;

        game.itemCount += game.production / (1000 / TICK_RATE);
        game.totalItemsCollected += game.production / (1000 / TICK_RATE);

        const cursor = game.upgrades.find(u => u.type == "cursor");
        game.itemsPerClick = getItemsPerClick(cursor) * boostMultiplier;

        game.crit = getCrit(cursor);

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

    function saveBonuses(bonuses) {
        localStorage.setItem("bonuses", JSON.stringify(
            bonuses.map(b => ({ id: b.id, level: b.level }))
        ));
    }

    return {
        subscribe,
        buyUpgrade,
        buyEnhancement,
        buyBonus,
        clickItem,
        resetGame,
        boostProduction,
        getProduction,
        GOD_MODE
    };
}

export const game = createGame();
