<script>
    import { game } from "../../../store/game";
    import { achievements } from "../../../store/achievements";
    import Tooltip from "../Shop/Good/Tooltip.svelte";

    const ENHANCE_TRESHOLD = 25;

    let bonuses = $derived([
        ...$game.bonuses.flatMap(bonus => {
            const level = bonus.level;
            const cost = game.getBonusCost({ ...bonus, level });
            let detail = bonus.detail;

            if (bonus.id === 5) {
                detail = detail.replace("[completion]", $achievements.completion.toString())
            }

            return {
                ...bonus,
                __original: bonus,
                detail,
                libelle: "bonus",
                cost,
                img: `./img/bonuses/${bonus.code}.png`,
                disabled: cost > $game.itemCount,
            };
        })
    ]);

    let upgrades = $derived([
        ...$game.buildings.flatMap((building, i) => {
            const level = building.level + i;
            const cost = game.getUpgradeCost(building, level);

            if (building.stock < ENHANCE_TRESHOLD * (level + 1)) return [];

            return {
                ...building,
                __original: building,
                libelle: "upgrade",
                cost,
                img: `./img/buildings/${building.id}.png`,
                disabled: cost > $game.itemCount,
                buy: () => game.buyUpgrade(building),
            };
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
