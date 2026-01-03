<script>
    import { game } from "../../../store/game";
    import { display } from "../../../store/display";
    import Building from "./Good/Building.svelte";

    let highestBuildingUnlocked = $derived(Math.max(...($game.buildings.filter(b => b.stock > 0 || b.id === 0)).map(b => b.id)));

    let buildings = $derived(
        $game.buildings
            .filter((building, i) => {
                return (
                    building.stock > 0 || i <= highestBuildingUnlocked + 2
                );
            })
            .map(building => {
                const cost = game.getBuildingCost(building, $game.amount);
                const unlocked = $game.totalItemsCollected >= building.cost;
                return {
                    ...building,
                    __original: building,
                    libelle: "building",
                    cost,
                    img: unlocked ? `./img/buildings/${building.id}.png` : "./img/item/locked.png",
                    unlocked,
                    disabled: $game.itemCount < cost,
                };
            })
    );

</script>

<div class="buildings">
    {#each buildings as building (building.id)}
        {#if $display.device === "desktop"}
            <button onmouseenter={(e) => game.mouseEnterTooltip("shop", { ...building, disabled: building.disabled }, e)} onmouseleave={game.mouseLeaveTooltip}>
                <Building {building} amount={$game.amount} />
            </button>
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
