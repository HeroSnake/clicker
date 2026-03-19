import { get, writable } from "svelte/store";
import buildings from "../assets/buildings.json";
import bonuses from "../assets/bonuses.json";
import seasons from "../assets/seasons.json";
import lang from "../assets/lang.json";
import { achievements } from "./achievements";
import { display } from "./display";
import { supabase } from '../lib/supabase';

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
        const buildings = loadBuildings();
        const mobile = get(display).device === "mobile";

        let state = {
            itemCount: +localStorage.getItem("itemCount") || 0,
            production: 0,
            itemsPerClick: 0,
            clickCount: +localStorage.getItem("clickCount") || 0,
            critCount: +localStorage.getItem("critCount") || 0,
            goldenItemCount: +localStorage.getItem("goldenItemCount") || 0,
            maxItemsCollected: +localStorage.getItem("maxItemsCollected") || 0,
            totalItemsCollected: +localStorage.getItem("totalItemsCollected") || 0,
            amount: 1,
            amounts: [1, 10, 100],
            buildings,
            bonuses: loadBonuses(),
            activeBoosts: [],
            isProductionBoosted: false,
            productionBonus: 0,
            goldenItemBoostPower: 0,
            goldenItemBoostDuration: 0,
            goldenItemSpawnChance: 0,
            cursorProductionPercentage: 0,
            milkProductionMultiplier: 0,
            goldenItemRadar: false,
            crit: {},
            seasons,
            seasonId: initSeason(),
            displayShop: !mobile,
            displayJournal: !mobile,
            displaySettings: false,
            tooltip: {
                display: false,
                data: {},
                x: 0,
                y: 0,
            },
        };

        getBestSave().then(cloudPayload => {
            if (cloudPayload) {
                update(current => {
                    return {
                        ...current,
                        ...cloudPayload,
                        buildings: loadBuildings(cloudPayload),
                        bonuses: loadBonuses(cloudPayload)
                    };
                });
                achievements.load(cloudPayload.buildings);
            }
        });

        achievements.load(buildings);

        return state;
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

    function loadBuildings(externalData = null) {
        const saved = externalData?.buildings || JSON.parse(localStorage.getItem("upgrades")) || [];

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

    function loadBonuses(externalData = null) {
        const saved = externalData?.bonuses || JSON.parse(localStorage.getItem("bonuses")) || [];

        return bonuses.filter(b => b.active).map(b => {
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
                    const production = game.production;

                    if (production == 0) return game;

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

                    return game;
                });
            }
        }
    }


    /* ---------------- CORE MATH ---------------- */

    function getBuildingProduction(building, base = false) {
        if (building.stock <= 0 && !base) return 0;

        const stock = base ? 1 : building.stock;

        return building.production * Math.pow(2, building.level) * stock;
    }

    function getBuildingCrit(building) {
        let chance = 0;
        let bonus = 0;
        let multiplier = 0;

        if (building.type === "cursor") {
            chance = building.crit.chance + building.level * building.crit.bonus,
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

    // COMPUTE ITEMS PER CLICK
    function getItemsPerClick(cursor) {
        return 1 * Math.pow(2, cursor.level);
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
        const costMultiplier = 5;
        return Math.floor(bonus.cost * (Math.pow(costMultiplier, bonus.level) * (costMultiplier - 1)) / (costMultiplier - 1));
    }

    function getBuildingUpgradeCost(building, level) {
        return Math.floor(getBuildingCost(building, 1, level * 25) / 2);
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

        const production = game.production;

        if (production <= 0) return;

        const gained = production * elapsedSeconds;

        game.itemCount += gained;
        game.totalItemsCollected += gained;

        if (game.itemCount > game.maxItemsCollected) {
            game.maxItemsCollected = game.itemCount;
        }

        console.info(
            `[Offline] +${Math.floor(gained)} items (${elapsedSeconds}s)`
        );
    }

    /* ---------------- ACTIONS ---------------- */

    const setSeason = id => update(game => {
        game.seasonId = id;
        return game;
    });

    const setAmount = amount => update(game => {
        game.amount = amount;
        return game;
    });

    const toggleShop = () => update(game => {
        if (get(display).device === "mobile") {
            game.displayJournal = false;
            game.displaySettings = false;
        }
        game.displayShop = !game.displayShop;
        return game;
    });

    const toggleJournal = () => update(game => {
        if (get(display).device === "mobile") {
            game.displayShop = false;
            game.displaySettings = false;
        }
        game.displayJournal = !game.displayJournal;
        return game;
    });

    const toggleSettings = () => update(game => {
        if (get(display).device === "mobile") {
            game.displayShop = false;
            game.displayJournal = false;
        }
        game.displaySettings = !game.displaySettings;
        return game;
    });

    const buyBuilding = (building, amount = 1) => update(game => {
        const cost = getBuildingCost(building, amount);
        if (game.itemCount < cost) return game;

        game.itemCount -= Math.floor(cost);
        building.stock += amount;

        saveUpgrades(game.buildings);
        return game;
    });

    const upgradeBuilding = building => update(game => {
        const cost = getBuildingUpgradeCost(building, building.level + 1);
        if (game.itemCount < cost) return game;

        game.itemCount -= cost;
        building.level++;

        saveUpgrades(game.buildings);
        return game;
    });

    const buyBonus = bonus => update(game => {
        const cost = getBonusCost(bonus);

        if (game.itemCount < cost) return game;

        game.itemCount -= cost;
        bonus.level++;

        saveBonuses(game.bonuses);
        return game;
    });

    const toggleBonus = code => update(game => {
        game[code] = !game[code];

        return game;
    })

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
        const now = Date.now();

        game.activeBoosts.push({
            multiplier: 5 * (1 + game.goldenItemBoostPower),
            startedAt: now,
            expiresAt: now + 5000 + (game.goldenItemBoostDuration * 1000)
        });

        return game;
    });

    const getBonuses = () => update(game => {
        game.bonuses.forEach(b => {
            if (b.level === 0) {
                game[b.code] = 0;
            } else {
                let increase = b.increase;
                if (b.unit == "%") {
                    increase = b.increase / 100;
                }
                game[b.code] = increase * b.level;
            }
        });

        return game;
    })

    const mouseEnterTooltip = async (parent, getDataFn, event, defaultDisplay = true) => update(game => {
        if (!defaultDisplay) return game;

        game.tooltip.getData = getDataFn;

        if (get(display).device === "desktop") {
            const tooltipEl = document.getElementById('tooltip');
            setPosition(parent, event.currentTarget, tooltipEl);
        }

        game.tooltip.display = true;

        return game;
    })

    const mouseLeaveTooltip = () => update(game => {
        game.tooltip.display = false;
        return game;
    })

    const setPosition = (parent, target, el) => update(game => {

        if (!parent || !target || !el) return;

        const tooltipRect = el.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const parentEl = document.getElementById(parent);
        const parentRect = parentEl.getBoundingClientRect();

        game.tooltip.x = window.innerWidth - parentRect.right + parentRect.width;

        // Center tooltip vertically with target by default
        const y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        const maxY = window.innerHeight - tooltipRect.height - 8;

        game.tooltip.y = y > maxY ? maxY : Math.max(8, y);

        return game;
    })

    /* ---------------- TICK ---------------- */

    const tickGame = () => update(game => {
        getBonuses();
        const boostMultiplier = getBoost(game);
        const totalProduction = getTotalProduction(game);

        game.production = (totalProduction * (1 + game.productionBonus) + ((game.milkProductionMultiplier * (get(achievements).completion / 2)) * totalProduction)) * boostMultiplier;

        game.itemCount += game.production / (1000 / TICK_RATE);
        game.totalItemsCollected += game.production / (1000 / TICK_RATE);

        const cursor = game.buildings.find(u => u.type == "cursor");
        game.itemsPerClick = getItemsPerClick(cursor) * boostMultiplier * (1 + game.cursorProductionPercentage * game.production);
        game.crit = getBuildingCrit(cursor);

        // Check achievements AT THE END
        achievements.evaluate();

        return game;
    });

    /* ---------------- SAVE ---------------- */

    async function saveData() {
        update(game => {
            const savePayload = {
                itemCount: Math.floor(game.itemCount),
                totalItemsCollected: game.totalItemsCollected,
                maxItemsCollected: game.maxItemsCollected,
                clickCount: game.clickCount,
                critCount: game.critCount,
                goldenItemCount: game.goldenItemCount,
                seasonId: game.seasonId,
                lastSaveAt: Date.now(),
                upgrades: game.buildings.map(b => ({ id: b.id, stock: b.stock, level: b.level })),
                bonuses: game.bonuses.map(b => ({ id: b.id, level: b.level }))
            };

            // ALWAYS save to LocalStorage
            Object.entries(savePayload).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });

            // IF logged in, sync to cloud
            syncToCloud(savePayload);

            return game;
        });
    }

    async function syncToCloud(payload) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase
                .from('saves')
                .upsert({
                    user_id: user.id,
                    payload: payload,
                    updated_at: new Date()
                });

            if (error) console.error("Cloud save failed:", error.message);
        }
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

    async function getBestSave() {
        const localLastSave = parseInt(localStorage.getItem("lastSaveAt")) || 0;

        const { data: { user } } = await supabase.auth.getUser();
        let cloudSave = null;

        if (user) {
            const { data } = await supabase
                .from('saves')
                .select('*')
                .eq('user_id', user.id)
                .single();
            cloudSave = data;
        }

        const cloudLastSave = cloudSave ? new Date(cloudSave.updated_at).getTime() : 0;

        if (cloudLastSave > localLastSave) {
            console.log("☁️ Loading from Cloud (Newer)");
            return cloudSave.payload;
        } else {
            console.log("💾 Loading from LocalStorage");
            return null;
        }
    }

    /* ---------------- AUTH ---------------- */

    async function login() {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
    }

    async function logout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout error:", error.message);
            return;
        }

        // localStorage.clear();
        // update(() => initGame());
    };

    return {
        subscribe,
        buyBuilding,
        upgradeBuilding,
        buyBonus,
        toggleBonus,
        getBonusCost,
        getBuildingUpgradeCost,
        getBuildingCost,
        clickItem,
        resetGame,
        clickGoldenItem,
        getBuildingProduction,
        setSeason,
        setAmount,
        toggleShop,
        toggleJournal,
        toggleSettings,
        mouseEnterTooltip,
        mouseLeaveTooltip,
        GOD_MODE,
        login,
        logout,
    };
}

export const game = createGame();
