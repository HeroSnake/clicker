<script>
    import { fly } from 'svelte/transition';
    import { game } from "../../../../store/game";
    import Body from "./Body.svelte";
    import Head from "./Head.svelte";
</script>

{#if $game.tooltip.display}
    <div id="tooltip"
        class="border wooden"
        class:disabled={$game.tooltip.data.disabled}
        style:top={$game.tooltip.y ? `${$game.tooltip.y}px` : 'unset'}
        style:right={$game.tooltip.x ? `${$game.tooltip.x}px` : 0}
        transition:fly={{ x: 150, duration: 150 }}
    >
        <Head data={$game.tooltip.data} />
        {#if $game.tooltip.data.libelle !== "achievement"}
            <div class="body">
                <Body data={$game.tooltip.data} />
            </div>
        {/if}
    </div>
{/if}

<style>
    #tooltip {
        position: absolute;
        pointer-events: none;
        color: #d1d1d1;
        padding: 10px;
        border-radius: 2px;
        font-size: 1.2rem;
        white-space: normal;
        z-index: 3;
        width: 500px;
        line-height: 1.2rem;
        background: url('/img/textures/wood-horizontal-dark.png');
        background-size: cover;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .disabled {
        filter: grayscale(100) brightness(0.8);
    }

    .body {
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        #tooltip {
            width: calc(100% - 30px);
            bottom: 0;
            top: auto !important;
        }
    }
</style>
