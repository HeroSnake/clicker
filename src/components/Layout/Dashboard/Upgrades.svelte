<script>
    import { game } from "../../../store/game";
    import Tooltip from "../Shop/Good/Tooltip.svelte";

    const ENHANCE_TRESHOLD = 25;
    const LEVELS_AHEAD = 1;

    let bonuses = $derived([
        ...$game.bonuses.flatMap(bonus => {
            return Array.from({ length: LEVELS_AHEAD }, (_, i) => {
                const displayLevel = bonus.level;
                const requiresLevel = displayLevel - 1;
                const cost = game.getBonusCost({ ...bonus, level: displayLevel });

                return {
                    ...bonus,
                    __original: bonus,
                    libelle: "bonus",
                    cost,
                    img: `./img/bonuses/${bonus.code}.png`,
                    disabled: bonus.level < requiresLevel || cost > $game.itemCount,
                };
            });
        })
    ]);

    let upgrades = $derived([
        ...$game.buildings.flatMap(building => {
            if (building.stock < ENHANCE_TRESHOLD * building.level) return [];

            return Array.from({ length: LEVELS_AHEAD }, (_, i) => {
                const displayLevel = building.level + 1 + i;
                const requiresLevel = displayLevel - 1;
                const cost = game.getUpgradeCost(building, displayLevel);

                return {
                    ...building,
                    __original: building,
                    libelle: "upgrade",
                    cost,
                    img: `./img/buildings/${building.id}.png`,
                    disabled: building.level < requiresLevel || cost > $game.itemCount,
                    buy: () => game.buyUpgrade(building),
                };
            });
        })
    ].sort((a, b) => a.cost - b.cost));
</script>

<div class="upgrades">
    {#each bonuses as bonus}
        <Tooltip data={bonus} parent="shop" disabled={bonus.disabled} >
            <button type="button" class="upgrade interactive" aria-label="upgrade"
                disabled={bonus.disabled}
                onclick={() => game.buyBonus(bonus.__original)}
                style="background-image: url('{bonus.img}');"
            >
            </button>
        </Tooltip>
    {/each}
    {#each upgrades as upgrade}
        <Tooltip data={upgrade} parent="shop" disabled={upgrade.disabled} >
            <button type="button" class="upgrade interactive" aria-label="upgrade"
                disabled={upgrade.disabled}
                onclick={() => game.buyUpgrade(upgrade.__original)}
                style="background-image: url('{upgrade.img}');"
            >
            </button>
        </Tooltip>
    {/each}
</div>

<style>
    .upgrades {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .upgrade {
        width: 60px;
        height: 60px;
        box-shadow: 0 0 12px 3px #000, 0 0 7px 2px #fff3;
    }
</style>
