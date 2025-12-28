<script>
    import { game } from "../../../../store/game";
    import { display } from "../../../../store/display";
    import Image from "./Image.svelte";
    import Cost from "./Cost.svelte";
    import Body from "./Body.svelte";

    const { building = {}, amount = 0 } = $props();

</script>

<button
    class="building"
    onclick={() => game.buyBuilding(building.__original, amount)}
    disabled={building.disabled}
>
    <Image img={building.img} />
    <div class="info">
        <span class="name">{building.name} <span class="level">(lvl {building.level})</span></span>
        <Cost value={building.cost} />
    </div>
    {#if building.stock > 0}
        <span class="stock">
            {building.stock}
        </span>
    {/if}
</button>
{#if $display.device === "mobile"}
    <div class="stats border wooden">
        <Body data={building} />
    </div>
{/if}

<style>
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

    .level {
        font-size: 1rem;
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
