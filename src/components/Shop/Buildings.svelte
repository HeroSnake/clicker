<script>
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import Tooltip from './Tooltip.svelte';
    import Cost from "./Cost.svelte";
    import BuildingImg from "./BuildingImg.svelte";

    export let amount = 1;

    $: buildings = $game.buildings
        .filter((building, i, arr) => {
            const lastOwnedIdx = arr.map(b => b.stock >= 1).lastIndexOf(true);
            return building.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
        })
        .flatMap(building => {
            const cost = game.getBuildingCost(building, amount);
            return {
                ...building,
                __original: building,
                libelle: "building",
                cost,
                img: `/img/${$theme.code}/buildings/${building.id}.png`,
                disabled: cost > $game.itemCount
            };
        });

</script>


<div class="buildings">
    {#each buildings as building, i}
        <Tooltip data={building}>
            <button class="no-btn building" on:click={() => game.buyBuilding(building.__original, amount)} disabled={building.disabled}>
                <BuildingImg img={building.img} />
                <div class="building-info">
                    <span class="name">{building.name}</span>
                    <Cost value={building.cost} />
                </div>
                {#if building.stock > 0}
                    <span class="stock">{building.stock}</span>
                {/if}
            </button>
        </Tooltip>
    {/each}
</div>

<style>
    .buildings {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-height: 100%;
        padding-bottom: 200px;
    }
    .building {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background-color: #353430;
    }
    .building:hover:not(:disabled) {
        background-color: #666561;
    }
    .building:disabled {
        filter: grayscale(100) brightness(0.8);
        cursor: auto;
    }
    .stock {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        font-size: 4.2rem;
        text-align: center;
        font-weight: bold;
        right: 5px;
        z-index: 1;
        opacity: 0.1;
    }
    .building-info {
        width: 100%;
        text-align: left;
        line-height: 1rem;
    }
    .name {
        font-size: 1.5rem;
        font-weight: bold;
    }
</style>