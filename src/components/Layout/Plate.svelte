<script>
    import { fly } from 'svelte/transition';
    import { game } from "../../store/game";
    import Fluid from "../Effects/Fluid.svelte";
    import GoldenItems from "../Effects/GoldenItems.svelte";
    import Rain from "../Effects/Rain.svelte";
    import RainingItems from "../Effects/RainingItems.svelte";
    import GodRays from "../Effects/GodRays.svelte";
    import Stats from '../Layout/Stats.svelte';
    import Snow from '../Effects/Snow.svelte';
    import ClickableItem from '../Item/ClickableItem.svelte';
    import Cursors from '../Item/Cursors.svelte';

    let plate = null;
</script>

<div
    id="plate"
    bind:this={plate}
    class:boosted={$game.isProductionBoosted}
    transition:fly={{ x: 300, duration: 300 }}
    style="background: url('./img/bg/{$game.seasonId}.png') no-repeat center center/cover;"
>
    <Stats />

    {#if plate}
        <ClickableItem  />

        <Cursors />

        <GoldenItems />

        <Fluid />

        <div id="lighting-overlay"></div>

        <RainingItems />

        <GodRays />

        {#if $game.seasonId == 1}
            <Rain />
        {:else if $game.seasonId == 4}
            <Snow />
        {/if}
    {/if}
</div>


<style>
    #plate {
        text-align: center;
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
        overflow: hidden;
        background-color: #222;
    }

    #plate::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 1; /* behind content */
        pointer-events: none;

        /* initial state: no glow */
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
        box-shadow:
            inset 0 0 16px 3px #FFD700,
            inset 0 0 32px 8px #FFD700,
            inset 0 0 48px 12px #FFD700,
            0 0 18px 5px #FFD700,
            0 0 36px 10px #FFD700;
        animation: goldenGlow 1.2s ease-in-out infinite alternate;
    }

    #plate.boosted::before {
        opacity: 1; /* fade in */
    }

    @keyframes goldenGlow {
        from {
            box-shadow:
                inset 0 0 14px 2px #FFD700,
                inset 0 0 28px 7px #FFD700,
                inset 0 0 42px 10px #FFD700,
                0 0 10px 4px #FFD700,
                0 0 16px 8px #FFD700;
        }
        to {
            box-shadow:
                inset 0 0 30px 8px #FFD700,
                inset 0 0 60px 16px #FFD700,
                inset 0 0 90px 24px #FFD700,
                0 0 38px 10px #FFD700,
                0 0 80px 30px #FFD700;
        }
    }

    #lighting-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%);
        z-index: -1;
    }
</style>
