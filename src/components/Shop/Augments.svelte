<script>
    import { getEnhancementCost, getBonusCost } from "../../utils";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import Tooltip from "./Tooltip.svelte";

    const ENHANCE_TRESHOLD = 10;
    const LEVELS_AHEAD = 2;

    // Combine enhancements and bonuses into one array
    $: augments = [
        ...$game.upgrades.flatMap(upgrade => {
            if (upgrade.stock < ENHANCE_TRESHOLD * upgrade.level) return [];

            return Array.from({ length: LEVELS_AHEAD }, (_, i) => {
                const displayLevel = upgrade.level + 1 + i;
                const requiresLevel = displayLevel - 1;

                return {
                    libelle: "enhancement",
                    ...upgrade,
                    displayLevel,
                    cost: getEnhancementCost({ ...upgrade, level: displayLevel }),
                    locked: upgrade.level < requiresLevel,
                    key: `e-${upgrade.id}-L${displayLevel}`,
                    img: `./img/upgrades/${$theme.code}/${upgrade.id}.png`,
                };
            });
        }),
        ...$game.bonuses.flatMap(bonus => {
            return Array.from({ length: LEVELS_AHEAD }, (_, i) => {
                const displayLevel = bonus.level + 1 + i;
                const requiresLevel = displayLevel - 1;

                return {
                    libelle: "bonus",
                    ...bonus,
                    displayLevel,
                    cost: getBonusCost({ ...bonus, level: displayLevel }),
                    locked: bonus.level < requiresLevel,
                    key: `b-${bonus.id}-L${displayLevel}`,
                    img: `./img/items/${$theme.code}-gold.png`,
                };
            });
        })
    ].sort((a, b) => a.cost - b.cost);
</script>

<div class="augments">
    {#each augments as augment (augment.key)}
        <Tooltip upgrade={augment} cost={augment.cost} type={augment.libelle}>
            <button type="button" class="no-btn augment" disabled={augment.locked || augment.cost > $game.itemCount}
                on:click={() =>
                    augment.libelle === "enhancement"
                        ? game.buyEnhancement(augment.id)
                        : game.buyBonus(augment.id)
                }
                style="background-image: url('{augment.img}'); background-size: cover;"
            >
            </button>
        </Tooltip>
    {/each}
</div>

<style>
    .augments {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .augment {
        width: 50px;
        height: 50px;
        position: relative;
        cursor: pointer;
        border: 3px solid #e48900b9;
        background-color: #272727;
        background-size: cover;
        transition: filter 0.15s ease;
        transform: scale(1);
        box-shadow: none;
        will-change: transform, box-shadow;
    }

    .augment:hover:not(:disabled) {
        animation: heartbeat 0.9s ease-in-out infinite;
        animation-play-state: running;
    }

    .augment:not(:hover):not(:disabled) {
        animation: none;
        z-index: 2;
    }

    @keyframes heartbeat {
        0% { transform: scale(1); box-shadow: none; }
        15% { transform: scale(1.12); box-shadow: 0 0 12px rgba(255, 215, 0, 0.8); }
        30% { transform: scale(1); box-shadow: none; }
        45% { transform: scale(1.08); box-shadow: 0 0 8px rgba(255, 215, 0, 0.5); }
        100% { transform: scale(1); box-shadow: none; }
    }

    .augment:disabled {
        filter: grayscale(100%) brightness(0.6);
        cursor: default;
    }
</style>
