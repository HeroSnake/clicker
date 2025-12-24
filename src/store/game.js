import { get, writable } from "svelte/store";
import buildings from "../assets/buildings.json";
import bonuses from "../assets/bonuses.json";
import seasons from "../assets/seasons.json";
import lang from "../assets/lang.json";
import { achievements } from "./achievements";
import { display } from "./display";

const GOD_MODE = import.meta.env.DEV ?? !!+import.meta.env.VITE_GOD_MODE;

const MAX_OFFLINE_TIME = 60 * 60 * 12; // 12 hours cap (seconds)
const TICK_RATE = 200;
const SAVE_RATE = 2000;

let hiddenAt = null;

function createGame() {
    const initialGame = initGame();
    applyOfflineProgress(initialGame);

    const { subscribe, update } = writable(initialGame, startLoops);

    /* ---------------- INIT ---------------- */

    function initGame() {
        return {
            itemCount: +localStorage.getItem("itemCount") || 0,
            production: 0,
            itemsPerClick: 0,
            clickCount: +localStorage.getItem("clickCount") || 0,
            critCount: +localStorage.getItem("critCount") || 0,
            goldenItemCount: +localStorage.getItem("goldenItemCount") || 0,
            maxItemsCollected: +localStorage.getItem("maxItemsCollected") || 0,
            totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
            buildings: mergeBuildings(),
            bonuses: mergeBonuses(),
            activeBoosts: [],
            isProductionBoosted: false,
            productionBonus: 0,
            goldenItemBoostPower: 0,
            goldenItemBoostDuration: 0,
            goldenItemSpawnChance: 0,
            cursorProductionPercentage: 0,
            crit: {},
            achievements: [],
            seasons,
            seasonId: initSeason(),
            displayShop: get(display).device === "desktop",
        };
    }

    function initSeason() {
        return parseInt(localStorage.getItem("seasonId")) || 1;
    }

    function startLoops() {
        const saveInterval = setInterval(saveData, SAVE_RATE);
        const tickInterval = setInterval(tickGame, TICK_RATE);

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(saveInterval);
            clearInterval(tickInterval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }

    function mergeBuildings() {
        const saved = JSON.parse(localStorage.getItem("upgrades")) || [];

        return buildings.map(b => {
            const s = saved.find(s => s.id === b.id);
            return {
                ...b,
                name: lang.buildings[b.id].name,
                description: lang.buildings[b.id].description,
                stock: s?.stock ?? b.stock,
                level: s?.level ?? b.level
            };
        });
    }

    function mergeBonuses() {
        const saved = JSON.parse(localStorage.getItem("bonuses")) || [];

        return bonuses.map(b => {
            const s = saved.find(s => s.id === b.id);
            const bonus = lang.bonuses[b.id];
            return {
                ...b,
                name: bonus.name,
                description: bonus.description,
                detail: bonus.detail,
                level: s?.level ?? b.level,
            };
        });
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            hiddenAt = Date.now();
        } else if (hiddenAt) {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - hiddenAt) / 1000);
            hiddenAt = null;

            if (elapsedSeconds > 1) {
                update(game => {
                    const production = getTotalProduction(game) * (1 + game.productionBonus);

                    if (production > 0) {
                        const gained = production * Math.min(elapsedSeconds, MAX_OFFLINE_TIME);

                        game.itemCount += gained;
                        game.totalItemsCollected += gained;

                        if (game.itemCount > game.maxItemsCollected) {
                            game.maxItemsCollected = game.itemCount;
                        }

                        saveData();

                        console.info(
                            `[Hidden] +${Math.floor(gained)} items (${elapsedSeconds}s)`
                        );
                    }

                    return game;
                });
            }
        }
    }


    /* ---------------- CORE MATH ---------------- */

    function getBuildingProduction(building, base = false) {
        if (building.stock <= 0 && !base) return 0;

        const stock = base ? 1 : building.stock;

        let levelMult = 1;
        if (building.level > 1) {
            levelMult = Math.pow(2, building.level - 1);
        }

        return building.production * levelMult * stock;
    }

    function getBuildingCrit(building) {
        let chance = 0;
        let bonus = 0;
        let multiplier = 0;

        if (building.type === "cursor") {
            chance = building.crit.chance + (building.level - 1) * building.crit.bonus,
            bonus = building.crit.bonus
            multiplier = building.crit.multiplier
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
                bonuses[b.code] = 0;
            } else {
                bonuses[b.code] = b.increase * (b.level - 1);
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

        for (const u of game.buildings) {
            production = production + getBuildingProduction(u);
        }

        return production;
    }

    function getBonusCost(bonus) {
        const costMultiplier = 10;
        return Math.floor(bonus.cost * (Math.pow(costMultiplier, bonus.level - 1) * (costMultiplier - 1)) / (costMultiplier - 1));
    }

    function getUpgradeCost(upgrade, level) {
        return Math.floor(getBuildingCost(upgrade, 1, level * 25) / 10);
    }

    function getBuildingCost(building, multiple, stock = null) {
        const costMultiplier = 1.15;
        const buildingCost = stock ?? building.stock;
        return Math.floor(building.cost * (Math.pow(costMultiplier, buildingCost) * (Math.pow(costMultiplier, multiple) - 1)) / (costMultiplier - 1));
    }

    function applyOfflineProgress(game) {
        const lastSave = +localStorage.getItem("lastSaveAt");
        if (!lastSave) return;

        const now = Date.now();
        let elapsedSeconds = Math.floor((now - lastSave) / 1000);
        if (elapsedSeconds <= 1) return;

        // Cap offline time
        elapsedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_TIME);

        // Compute base production (no boosts)
        const baseProduction = getTotalProduction(game) * (1 + game.productionBonus);

        if (baseProduction <= 0) return;

        const gained = baseProduction * elapsedSeconds;

        game.itemCount += gained;
        game.totalItemsCollected += gained;

        if (game.itemCount > game.maxItemsCollected) {
            game.maxItemsCollected = game.itemCount;
        }

        console.info(
            `[Offline] +${Math.floor(gained)} items (${elapsedSeconds}s)`
        );
    }


    function computeAchievements(game) {
        achievements.evaluate({
            clicks: game.clickCount,
            critical_clicks: game.critCount,
            critical_chance: game.crit?.chance ?? 0,
            items_total: game.totalItemsCollected,
            production: game.production,
            golden_clicks: game.goldenItemCount,
            buildings_total: game.buildings.reduce((a, b) => a + b.stock, 0),
            bonuses_total: game.bonuses.length,
            buildings: game.buildingsById, // optional
            upgrades: game.upgradesById    // optional
        });
    }

    /* ---------------- ACTIONS ---------------- */

    const setSeason = id => update(game => {
        game.seasonId = id;
        return game;
    });

    const toggleShop = () => update(game => {
        game.displayShop = !game.displayShop;
        return game;
    });

    const buyBuilding = (building, amount = 1) => update(game => {
        const cost = getBuildingCost(building, amount);
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= Math.floor(cost);
        building.stock += amount;

        saveUpgrades(game.buildings);
        return game;
    });

    const buyUpgrade = upgrade => update(game => {
        const cost = getUpgradeCost(upgrade, upgrade.level + 1);
        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= cost;
        upgrade.level++;

        saveUpgrades(game.buildings);
        return game;
    });

    const buyBonus = bonus => update(game => {
        const cost = getBonusCost(bonus);

        if (!GOD_MODE && game.itemCount < cost) return game;

        game.itemCount -= cost;
        bonus.level++;

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
            game.clickCount++;

            if (game.itemCount > game.maxItemsCollected) {
                game.maxItemsCollected = game.itemCount;
            }

            if (isCrit) {
                game.critCount++;
            }

            critResult = { clickValue, isCrit };
            return game;
        });
        return critResult;
    };

    const clickGoldenItem = () => update(game => {
        game.goldenItemCount++;
        boostProduction();
        return game;
    });

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
        game.cursorProductionPercentage = bonuses.cursorProductionPercentage;
        game.production = getTotalProduction(game) * (1 + game.productionBonus) * boostMultiplier;

        game.itemCount += game.production / (1000 / TICK_RATE);
        game.totalItemsCollected += game.production / (1000 / TICK_RATE);

        const cursor = game.buildings.find(u => u.type == "cursor");
        game.itemsPerClick = getItemsPerClick(cursor) * boostMultiplier * (1 + game.cursorProductionPercentage * game.production);
        game.crit = getBuildingCrit(cursor);

        // Check achievements AT THE END
        // computeAchievements(game);

        return game;
    });

    /* ---------------- SAVE ---------------- */

    function saveData() {
        update(game => {
            localStorage.setItem("itemCount", Math.floor(game.itemCount).toString());
            localStorage.setItem("totalItemsCollected", game.totalItemsCollected.toString());
            localStorage.setItem("maxItemsCollected", game.maxItemsCollected.toString());
            localStorage.setItem("clickCount", game.clickCount.toString());
            localStorage.setItem("critCount", game.critCount.toString());
            localStorage.setItem("goldenItemCount", game.goldenItemCount.toString());
            localStorage.setItem("seasonId", game.seasonId.toString());
            localStorage.setItem("lastSaveAt", Date.now().toString());

            saveUpgrades(game.buildings);
            saveBonuses(game.bonuses);
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
        buyBuilding,
        buyUpgrade,
        buyBonus,
        getBonusCost,
        getUpgradeCost,
        getBuildingCost,
        clickItem,
        resetGame,
        clickGoldenItem,
        getBuildingProduction,
        setSeason,
        toggleShop,
        GOD_MODE
    };
}

export const game = createGame();
