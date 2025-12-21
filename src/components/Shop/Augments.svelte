<script>
    import { getEnhancementCost, getBonusCost } from "../../utils";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import Tooltip from "./Tooltip.svelte";

    const ENHANCE_TRESHOLD = 25;
    const LEVELS_AHEAD = 1;

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
                    cost: getEnhancementCost({ ...upgrade, level: displayLevel }),
                    img: `./img/${$theme.code}/upgrades/${upgrade.id}.png`,
                    disabled: upgrade.level < requiresLevel || upgrade.cost > $game.itemCount,
                };
            });
        }),
        ...$game.bonuses.flatMap(bonus => {
            return Array.from({ length: LEVELS_AHEAD }, (_, i) => {
                const displayLevel = bonus.level;
                const requiresLevel = displayLevel - 1;

                return {
                    libelle: "bonus",
                    ...bonus,
                    cost: getBonusCost({ ...bonus, level: displayLevel }),
                    img: `./img/${$theme.code}/upgrades/${bonus.code}.png`,
                    disabled: bonus.level < requiresLevel || bonus.cost > $game.itemCount,
                };
            });
        })
    ].sort((a, b) => a.cost - b.cost);
</script>

<div class="augments">
    {#each augments as augment}
        <Tooltip upgrade={augment} cost={augment.cost} img={augment.img} type={augment.libelle}>
            <button type="button" class="no-btn augment interactive" aria-label="augment"
                disabled={augment.disabled}
                on:click={() =>
                    augment.libelle === "enhancement"
                        ? game.buyEnhancement(augment.id)
                        : game.buyBonus(augment.id)
                }
                style="background-image: url('{augment.img}');"
            >
            </button>
        </Tooltip>
    {/each}
</div>

<style>
    .augments {
        display: flex;
        flex-wrap: wrap;
    }

    .augment {
        width: 60px;
        height: 60px;
        transform: scale(1.2);
    }
</style>
