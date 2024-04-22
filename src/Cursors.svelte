<script>
    import { game } from "./store/game";
    import { onMount } from "svelte";

    let cursors = 200 ?? $game.upgrades.find(u => u.id == 0).stock

    const CURSOR_BY_LINE = 50

    $: effects = (count) => {
        let step = Math.floor(count / CURSOR_BY_LINE)
        let translate = 7 * step + 10
        let rotation = count * (360 / CURSOR_BY_LINE) + step
        let opacity = 1 - (step / 5)

        return `transform: rotate(${rotation}deg) translateY(${translate}%); opacity: ${opacity}`
    }
</script>

<div id="cursor-container">
    {#each Array(cursors) as _, i}
    <img
        src="./img/upgrades/cursor-v2.png"
        alt="Cursor"
        class="cursor"
        style="{effects(i)}"
    />
    {/each}
</div>


<style>
    #cursor-container {
        position: absolute;
        display: flex;
        height: 110%;
        width: 110%;
        top: -5%;
        left: -5%;
        animation: rotationCursor 100s linear infinite;
    }

    @keyframes rotationCursor {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .cursor {
        position: absolute;
        left: 0;
        height: auto;
        width: 100%;
        pointer-events: none;
    }
</style>
