import { writable, get } from "svelte/store";
import achievementsData from "./../assets/achievements.json";
import buildings from "./../assets/buildings.json";

const STORAGE_KEY = "achievements";

function createAchievementsStore() {
    const { subscribe, update, set } = writable({
        unlocked: new Set(),
        newlyUnlocked: []
    });

    function load() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        set({
            unlocked: new Set(saved),
            newlyUnlocked: []
        });
    }

    function save(unlocked) {
        // localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
    }

    function evaluate(stats) {
        update(state => {
            const unlocked = new Set(state.unlocked);
            const newlyUnlocked = [];

            for (const conditionGroup of achievementsData) {
                const condition = conditionGroup.condition;

                for (const achievement of conditionGroup.list) {
                    if (unlocked.has(achievement.id)) continue;

                    if (checkCondition(condition, achievement.value, stats)) {
                        if (conditionGroup.condition === "building") {

                        } else if (conditionGroup.condition === "upgrade") {

                        }

                        const id = `${conditionGroup.id}_${achievement.id}`;

                        unlocked.add(id);
                        newlyUnlocked.push(id);
                    }
                }
            }

            if (newlyUnlocked.length > 0) {
                save(unlocked);
            }

            return {
                unlocked,
                newlyUnlocked
            };
        });
    }

    /**
     * Clears the "newlyUnlocked" list after UI shows it
     */
    function clearNew() {
        update(state => ({
            ...state,
            newlyUnlocked: []
        }));
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        set({
            unlocked: new Set(),
            newlyUnlocked: []
        });
    }

    function initAchievementList(gameState) {
        let result = [];

        for (const condition of achievementsData) {
            for (const achievement of condition.list) {
                const id =  `${condition.id}_${achievement.id}`;
                const name = achievement.name;
                const value = achievement.value;
                const description = prepareString(achievement.id === 1 ? condition.description_first : condition.description, value);

                if (condition.condition === "building" || condition.condition === "upgrade") {
                    gameState.buildings.forEach(building => {
                        result.push({
                            id,
                            name:  name.replace('[building]', building.name),
                            description: description.replace('[building]', building.name),
                            value
                        })
                    });
                } else {
                    result.push({
                        id,
                        name,
                        description,
                        value
                    })
                }
            }
        }

        result.sort((a, b) => Number(a.value) - Number(b.value));
        console.log(result);

        return result;
    }

    return {
        subscribe,
        initAchievementList,
        load,
        evaluate,
        clearNew,
        reset
    };
}

function prepareString(string, value) {
    return string.replace("[value]", value);
}

function checkCondition(condition, value, stats) {
    switch (condition) {
        case "clicks":
            return stats.clicks >= value;

        case "critical_clicks":
            return stats.critical_clicks >= value;

        case "critical_chance":
            return stats.critical_chance >= value;

        case "items_total":
            return stats.items_total >= value;

        case "production":
            return stats.production >= value;

        case "golden_clicks":
            return stats.golden_clicks >= value;

        case "buildings_total":
            return stats.buildings_total >= value;

        case "building":
            // value = { id, amount }
            // return (stats.buildings.find(b => b.id ===) || 0) >= value.amount;

        case "upgrades_total":
            return stats.upgrades_total >= value;

        case "upgrade":
            // value = { id, amount }
            return (stats.upgrades?.[value.id] || 0) >= value.amount;

        case "bonuses_total":
            return stats.bonuses_total >= value;

        default:
            return false;
    }
}

export const achievements = createAchievementsStore();
