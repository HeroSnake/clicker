import { writable, get } from "svelte/store";
import achievementsData from "./../assets/achievements.json";

const STORAGE_KEY = "achievements";

/**
 * Internal state:
 * {
 *   unlocked: Set<number>,
 *   newlyUnlocked: Achievement[]
 * }
 */
function createAchievementsStore() {
    const { subscribe, update, set } = writable({
        unlocked: new Set(),
        newlyUnlocked: []
    });

    // Load unlocked achievements from storage
    function load() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        set({
            unlocked: new Set(saved),
            newlyUnlocked: []
        });
    }

    function save(unlocked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
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
                        unlocked.add(achievement.id);
                        newlyUnlocked.push({
                            ...achievement,
                            condition
                        });
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

    /**
     * Reset achievements (for prestige/debug)
     */
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        set({
            unlocked: new Set(),
            newlyUnlocked: []
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

/**
 * Condition resolver
 */
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
            return (stats.buildings?.[value.id] || 0) >= value.amount;

        case "upgrades_total":
            return stats.upgrades_total >= value;

        case "upgrades":
            // value = { id, amount }
            return (stats.upgrades?.[value.id] || 0) >= value.amount;

        case "bonuses_total":
            return stats.bonuses_total >= value;

        default:
            return false;
    }
}

export const achievements = createAchievementsStore();
