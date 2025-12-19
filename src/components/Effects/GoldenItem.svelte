<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { game } from "../../store/game";
    import Glow from "./Glow.svelte";
    import GodRays from "./GodRays.svelte";
    import Item from "./../Item/Item.svelte";

    let goldenItems = [];
    let nextId = 0;
    let buttonEl;

    const DESPAWN_TIME = 7000;
    const FADE_DURATION = 400;
    const CLICK_FADE_DURATION = 0;

    function spawn() {
        const id = nextId++;
        const plate = document.getElementById('plate');

        goldenItems = [
            ...goldenItems,
            {
                id,
                x: Math.random() * ((plate?.offsetWidth ?? 0) - 60),
                y: Math.random() * ((plate?.offsetHeight ?? 0) - 60),
                removing: false,
                fadeDuration: FADE_DURATION,
                timeout: setTimeout(() => despawn(id), DESPAWN_TIME)
            }
        ];
    }

    function despawn(id, click = false) {
        goldenItems = goldenItems.map(item =>
            item.id === id
                ? {
                    ...item,
                    removing: true,
                    fadeDuration: click ? CLICK_FADE_DURATION : FADE_DURATION
                  }
                : item
        );

        setTimeout(() => {
            goldenItems = goldenItems.filter(item => item.id !== id);
        }, click ? CLICK_FADE_DURATION : FADE_DURATION);
    }

    function clickGoldenItem(id) {
        game.boostProduction();
        despawn(id, true);
    }

    onMount(() => {
        const interval = setInterval(() => {
            if (Math.random() < $game.goldenItemSpawnChance) {
                spawn();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            goldenItems.forEach(item => clearTimeout(item.timeout));
        };
    });
</script>

{#each goldenItems as item (item.id)}
    <div
        class="golden-wrapper"
        style="left:{item.x}px; top:{item.y}px;"
        transition:fade={{ duration: item.fadeDuration }}
    >
        <div class="bounce">
            <button bind:this={buttonEl} class="golden-item no-btn" on:click={() => clickGoldenItem(item.id)}>
                <Glow />
                <GodRays size={250} color="255,215,0" />
                <div class="golden-item-img">
                    <Item mode="gold" />
                </div>
            </button>
        </div>
    </div>
{/each}

<style>
    .golden-wrapper {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
    }
    .bounce {
        animation: bounce 1s infinite alternate;
        pointer-events: auto;
    }
    .golden-item-img {
        width: 50px;
        display: block;
    }
    @keyframes bounce {
        0%   { transform: translateY(0); }
        50%  { transform: translateY(-10px); }
        100% { transform: translateY(0); }
    }
</style>
