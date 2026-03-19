<script>
    import { game } from "../../../../store/game";
    import { display } from "../../../../store/display";
    import Image from "./Image.svelte";
    import Cost from "./Cost.svelte";
    import Body from "./Body.svelte";

    const { building = {}, amount = 0 } = $props();

    const ENHANCE_TRESHOLD = 25;

    let upgrade = $derived.by(() => {
        const level = building.level + 1;

        const cost = game.getBuildingUpgradeCost(building, level);
        const disabled = (building.stock < level * ENHANCE_TRESHOLD || $game.totalItemsCollected < cost / 2) || cost > $game.itemCount

        return {
            cost,
            disabled,
        }
    });

</script>

<div class="building-row">
    <button
        class="building"
        onclick={() => game.buyBuilding(building.__original, amount)}
        disabled={building.disabled}
        onmouseenter={(e) => game.mouseEnterTooltip("shop", () => ({
            ...building,
            cost: building.cost,
            disabled: building.disabled,
            libelle: "building"
        }), e, $display.device !== "mobile")}
        onmouseleave={game.mouseLeaveTooltip}
    >
        <Image img={building.img} />
        <div class="info">
            {#if building.unlocked}
                <span class="name">{building.name}</span>
            {:else}
                <span class="name">???</span>
            {/if}
            <Cost value={building.cost} />
        </div>
        {#if building.stock > 0}
            <span class="stock">
                {building.stock}
            </span>
        {/if}
    </button>

    <button
        class="level-up interactive"
        onclick={() => game.upgradeBuilding(building.__original)}
        disabled={upgrade.disabled}
        onmouseenter={(e) => game.mouseEnterTooltip("shop", () => ({
            ...building,
            cost: upgrade.cost,
            disabled: upgrade.disabled,
            libelle: "upgrade"
        }), e, $display.device !== "mobile")}
        onmouseleave={game.mouseLeaveTooltip}
    >
        <span class="level">{building.level}</span>
    </button>
</div>
{#if $display.device === "mobile"}
    <div class="stats border wooden">
        <Body data={building} />
    </div>
{/if}

<style>
    .building-row {
        display: flex;
    }

    .level-up {
        text-align: center;
        width: 20%;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #000;
    }

    .level-up::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('/img/textures/stone-square.png');
        background-size: contain;
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .level-up:hover:not(:disabled) {
        filter: brightness(1.3);
        box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.2);
    }

    .level-up:disabled {
        filter: grayscale(100) brightness(0.8);
        cursor: auto;
    }

    .level {
        font-size: 2rem;
        color: #ffffff;
        opacity: 0.7;
    }

    .building {
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        border-radius: 10px;
        overflow: hidden;
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
        box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.2);
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
        right: 5px;
        z-index: -1;
        color: #000;
        opacity: 0.7;
    }

    .info {
        width: 100%;
        text-align: left;
        line-height: 1rem;
    }

    .name {
        font-size: 1.5rem;
        font-weight: bold;
    }

    .stats {
        pointer-events: none;
        padding: 10px;
        border-radius: 2px;
        white-space: normal;
        line-height: 1.2rem;
        background: url('/img/textures/wood-horizontal-dark.png');
        background-size: cover;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }
</style>
