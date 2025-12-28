<script>
    import { onMount } from "svelte";
    import { game } from "../../store/game";
    import Item from "../Item/Item.svelte";

    const SIZE = 100;
    const DESPAWN_TIME = 7000;
    const SPAWN_INTERVAL = 2500;

    let goldenItems = $state([]);
    let nextId = 0;
    let canvas;

    function spawn() {
        const id = nextId++;

        goldenItems = [
            ...goldenItems,
            {
                id,
                x: Math.random() * (canvas.clientWidth - SIZE),
                y: Math.random() * (canvas.clientHeight - SIZE),
                spawnTime: performance.now()
            }
        ];

        setTimeout(() => despawn(id), DESPAWN_TIME);
    }

    function despawn(id) {
        goldenItems = goldenItems.filter(item => item.id !== id);
    }

    function clickItem(id) {
        game.clickGoldenItem();
        despawn(id);
    }

    onMount(() => {
        const interval = setInterval(() => {
            if (Math.random() < $game.goldenItemSpawnChance) spawn();
        }, SPAWN_INTERVAL);

        return () => clearInterval(interval);
    });
</script>

<div id="golden-items" bind:this={canvas}>
    {#each goldenItems as item (item.id)}
        <button
            class="golden-item-wrapper"
            style="left: {item.x}px; top: {item.y}px;"
            onclick={() => clickItem(item.id)}
        >
            <div class="golden-item">
                <Item mode="gold" />
            </div>
        </button>
    {/each}
</div>

<style>
    #golden-items {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
    }
    .golden-item-wrapper {
        position: absolute;
        width: 50px;
        height: 50px;
        pointer-events: auto;
        cursor: pointer;
        animation: bounce 1s infinite alternate;
        z-index: 1000;
    }

    .golden-item {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 30%, rgba(255,215,0,1) 0%, rgba(255,215,0,0.3) 70%);
        box-shadow: 0 0 15px rgba(255,215,0,0.6),
                    0 0 30px rgba(255,215,0,0.4) inset;
    }

    .golden-item::before {
        content: "";
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(255, 223, 0, 0.6),
                    0 0 20px rgba(255, 215, 0, 0.5),
                    0 0 30px rgba(255, 223, 0, 0.3);
        animation: shimmer 2s infinite linear;
        z-index: 0;
    }

    @keyframes shimmer {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(10deg) scale(1.05); }
        100% { transform: rotate(-10deg) scale(1); }
    }

    @keyframes bounce {
        0%   { transform: translateY(0); }
        50%  { transform: translateY(-10px); }
        100% { transform: translateY(0); }
    }
</style>
