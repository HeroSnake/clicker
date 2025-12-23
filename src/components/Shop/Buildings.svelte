<script>
    import { game } from "../../store/game";
    import Tooltip from './Tooltip.svelte';
    import Cost from "./Cost.svelte";
    import BuildingImg from "./BuildingImg.svelte";

    const props = $props();

    let buildings = $derived($game.buildings
        .filter((building, i, arr) => {
            const lastOwnedIdx = arr.map(b => b.stock >= 1).lastIndexOf(true);
            return building.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
        })
        .flatMap(building => {
            const cost = game.getBuildingCost(building, props.amount);
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
        <Tooltip data={building}>
            <button class="no-btn building" onclick={() => game.buyBuilding(building.__original, props.amount)} disabled={building.disabled}>
                <BuildingImg img={building.img} />
                <div class="building-info">
                    <span class="name">{building.name}</span>
                    <Cost value={building.cost} />
                </div>
                {#if building.stock > 0}
                    <span class="stock">
                        {building.stock}
                    </span>
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
    }

    .building {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.2), 0 0 7px 2px rgba(0, 0, 0, 0.2);
    }

    .building::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('/img/textures/wooden-logs.png');
        filter: brightness(0.65);
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .building:hover:not(:disabled) {
        filter: brightness(1.3);
        box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.2), 0 0 7px 2px rgba(255, 255, 255, 0.2);
    }

    .building:disabled {
        filter: grayscale(100) brightness(0.8);
        cursor: auto;
    }

    .stock {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        font-size: 3rem;
        text-align: center;
        /* font-weight: bold; */
        right: 5px;
        z-index: 1;
        color: #fff;
        opacity: 0.7;
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