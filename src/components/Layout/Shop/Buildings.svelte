<script>
    import { game } from "../../../store/game";
    import { display } from "../../../store/display";
    import Building from "./Good/Building.svelte";
    import Tooltip from "./Good/Tooltip.svelte";

    let buildings = $derived($game.buildings
        .filter((building, i, arr) => {
            const lastOwnedIdx = arr.map(b => b.stock >= 1).lastIndexOf(true);
            return building.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
        })
        .flatMap(building => {
            const cost = game.getBuildingCost(building, $game.amount);
            return {
                ...building,
                __original: building,
                libelle: "building",
                cost,
                img: `./img/buildings/${building.id}.png`,
                disabled: cost > $game.itemCount
            };
        }));

</script>


<div class="buildings">
    {#each buildings as building}
        {#if $display.device === "desktop"}
            <Tooltip data={building} parent="shop">
                <Building {building} amount={$game.amount} />
            </Tooltip>
        {:else}
            <Building {building} amount={$game.amount} />
        {/if}
    {/each}
</div>

<style>
    .buildings {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
</style>
