<script>
    import { game } from "../../../store/game";
    import { display } from "../../../store/display";
    import Building from "./Good/Building.svelte";
    import Tooltip from "./Good/Tooltip.svelte";

    let buildings = $derived(
        $game.buildings
            .filter((building, i) => {
                return (
                    building.stock > 0 || i <= $game.highestBuildingUnlocked + 2
                );
            })
            .map(building => {
                const cost = game.getBuildingCost(building, $game.amount);

                return {
                    ...building,
                    __original: building,
                    libelle: "building",
                    cost,
                    img: `./img/buildings/${building.id}.png`,
                    unlocked: $game.totalItemsCollected >= cost,
                    disabled: $game.itemCount < cost,
                };
            })
    );

</script>


<div class="buildings">
    {#each buildings as building (building.id)}
        {#if $display.device === "desktop"}
            <Tooltip data={building} parent="shop" disabled={!building.unlocked} >
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
