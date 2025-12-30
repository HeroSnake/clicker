<script>
    import { game } from "../../../store/game";
    import Tooltip from "../Shop/Good/Tooltip.svelte";

    const ENHANCE_TRESHOLD = 25;

    let bonuses = $derived([
        ...$game.bonuses.flatMap(bonus => {
            const level = bonus.level;
            const cost = game.getBonusCost({ ...bonus, level });

            return {
                ...bonus,
                __original: bonus,
                libelle: "bonus",
                cost,
                img: `./img/bonuses/${bonus.code}.png`,
                disabled: cost > $game.itemCount,
            };
        })
    ]);

    let upgrades = $derived.by(() => {
        let result = [];

        $game.buildings.forEach(building => {
            const level = building.level + 1;

            for (let l = level; l <= level + 1; l++) {
                const cost = game.getUpgradeCost(building, l);

                if (building.stock < l * ENHANCE_TRESHOLD || $game.totalItemsCollected < cost / 2) break;

                result.push({
                    ...building,
                    __original: building,
                    libelle: "upgrade",
                    cost,
                    img: `./img/buildings/${building.id}.png`,
                    disabled: cost > $game.itemCount,
                    buy: () => game.buyUpgrade(building),
                });
            }
        })
        return result.sort((a, b) => a.cost - b.cost);
    });
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
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        justify-items: center;
        gap: 5px;
    }

    .upgrade {
        width: 60px;
        height: 60px;
        box-shadow: 0 0 12px 3px #000, 0 0 7px 2px #fff3;
    }
</style>
