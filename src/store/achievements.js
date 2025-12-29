import { writable, get } from "svelte/store";
import { game } from "./game";
import achievementsData from "./../assets/achievements.json";
import { displayNumber } from "../utils";

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

        achievementsData.forEach(data => {
            data.list.forEach(achievement => {
                const groupId = data.id;
                const achievementId = achievement.id;
                const id = `${data.id}_${achievementId}`;
                const value = achievement.value;
                const name = achievement.name;
                const descTemplate = achievementId === 1 ? data.description_first : data.description;
                const description = prepareString(descTemplate, displayNumber(value, true));
                const condition = data.condition;
                const libelle = "achievement";

                if (condition === "building" || condition === "upgrade") {
                    buildings.forEach(building => {
                        let hue = 0;
                        if (achievementId > 1) {
                            hue = 360 * ((achievementId - 1) / data.list.length);
                        }

                        result.push({
                            id: `${id}_${building.id}`,
                            achievementId,
                            groupId,
                            buildingId: building.id,
                            name: name.replace('[building]', building.name),
                            description: description.replace('[building]', building.name),
                            value,
                            condition,
                            libelle,
                            img: `/img/buildings/${building.id}.png`,
                            hue
                        });
                    });
                } else {
                    result.push({
                        id,
                        achievementId,
                        groupId,
                        buildingId: null,
                        name,
                        description,
                        value,
                        condition,
                        libelle,
                        img: "/img/achievements/locked.png",
                    });
                }
            });
        });

        return result.sort((a, b) => {
            if (a.groupId !== b.groupId) return a.groupId - b.groupId;
            if (a.achievementId !== b.achievementId) return a.achievementId - b.achievementId;

            if (a.buildingId == null && b.buildingId == null) return 0;
            if (a.buildingId == null) return -1;
            if (b.buildingId == null) return 1;

            return a.buildingId - b.buildingId;
        });
    }

    function save(unlocked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
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
            bonuses_total: get(game).bonuses.reduce((a, b) => a + b.level - 1, 0),
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

            return achievements;
        });
    }

    function clear(id) {
        update(achievements => {
            achievements.newlyUnlocked.delete(id);
            return achievements;
        });
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
        clear,
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
            return stats.critical_chance * 100 >= achievement.value;

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
            return (stats.buildings.find(b => b.id === achievement.buildingId).level || 0) >= achievement.value;

        case "bonuses_total":
            return stats.bonuses_total >= achievement.value;

        default:
            return false;
    }
}

export const achievements = createAchievements();
