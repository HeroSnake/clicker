import { writable, get } from "svelte/store";
import { game } from "./game";
import achievementsData from "./../assets/achievements.json";

const STORAGE_KEY = "achievements";

function createAchievements() {
    const { subscribe, update, set } = writable({
        list: [],
        unlocked: new Set(),
        newlyUnlocked: new Set(),
    });

    function load(buildings) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        set({
            list: initList(buildings),
            unlocked: new Set(saved),
            newlyUnlocked: new Set(),
        });
    }

    function initList(buildings) {
        let result = [];

        for (const data of achievementsData) {
            for (const achievement of data.list) {
                const id =  `${data.id}_${achievement.id}`;
                const name = achievement.name;
                const value = achievement.value;
                const description = prepareString(achievement.id === 1 ? data.description_first : data.description, value);
                const condition = data.condition;

                if (["building", "upgrade"].includes(condition)) {
                    buildings.forEach(building => {
                        result.push({
                            id: `${id}_${building.id}`,
                            buildingId: building.id,
                            name:  name.replace('[building]', building.name),
                            description: description.replace('[building]', building.name),
                            value,
                            condition,
                        })
                    });
                } else {
                    result.push({
                        id,
                        name,
                        description,
                        value,
                        condition,
                    })
                }
            }
        }

        result.sort((a, b) => Number(a.value) - Number(b.value));

        return result;
    }

    function save(unlocked) {
        // localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
    }

    function evaluate() {
        const buildings = get(game).buildings;
        const upgrades = buildings
            .filter(b => b.level > 1)
            .reduce((acc, b) => {
                acc[b.id] = b.level;
                return acc;
            }, {});

        const stats = {
            clicks: get(game).clickCount,
            critical_clicks: get(game).critCount,
            critical_chance: get(game).crit?.chance ?? 0,
            items_total: get(game).totalItemsCollected,
            production: get(game).production,
            golden_clicks: get(game).goldenItemCount,
            buildings_total: buildings.reduce((a, b) => a + b.stock, 0),
            bonuses_total: get(game).bonuses.length,
            buildings: buildings,
            upgrades,
        };

        update(achievements => {
            for (const a of achievements.list) {

                if (achievements.unlocked.has(a.id)) {
                    continue;
                }

                if (check(a, stats)) {
                    achievements.unlocked.add(a.id);
                    achievements.newlyUnlocked.add(a.id);
                }
            }

            if (achievements.newlyUnlocked.size > 0) {
                save(achievements.unlocked);
            }

            console.log(achievements.unlocked);


            // Optionally, remove or keep this debug log
            // console.log(achievements);

            return achievements;
        });
    }

    /**
     * Clears the "newlyUnlocked" list after UI shows it
     */
    function clearNew() {
        update(state => ({
            ...state,
            newlyUnlocked: new Set(),
        }));
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        set({
            list: [],
            unlocked: new Set(),
            newlyUnlocked: new Set(),
        });
    }

    return {
        subscribe,
        load,
        evaluate,
        clearNew,
        reset
    };
}

function prepareString(string, value) {
    return string.replace("[value]", value);
}

function check(achievement, stats) {
    switch (achievement.condition) {
        case "clicks":
            return stats.clicks >= achievement.value;

        case "critical_clicks":
            return stats.critical_clicks >= achievement.value;

        case "critical_chance":
            return stats.critical_chance >= achievement.value;

        case "items_total":
            return stats.items_total >= achievement.value;

        case "production":
            return stats.production >= achievement.value;

        case "golden_clicks":
            return stats.golden_clicks >= achievement.value;

        case "buildings_total":
            return stats.buildings_total >= achievement.value;

        case "building":
            return (stats.buildings.find(b => b.id === achievement.buildingId).stock || 0) >= achievement.value;

        case "upgrade":
            return (stats.buildings.find(b => b.id === achievement.buildingId).level || 0) >= achievement.value + 1;

        case "bonuses_total":
            return stats.bonuses_total >= achievement.value;

        default:
            return false;
    }
}

export const achievements = createAchievements();
