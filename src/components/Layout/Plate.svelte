<script>
    import { fly } from 'svelte/transition';
    import { theme } from '../../store/theme';
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
    import Fluid from "../Effects/Fluid.svelte";
    import GoldenItems from "../Effects/GoldenItems.svelte";
    import Rain from "../Effects/Rain.svelte";
    import RainingItems from "../Effects/RainingItems.svelte";
    import GodRays from "../Effects/GodRays.svelte";
    import Cursors from "../Item/Cursors.svelte";
    import Stats from '../Layout/Stats.svelte';
    import Item from '../Item/Item.svelte';
    import Boost from '../Effects/Boost.svelte';
    import ClickText from '../Effects/ClickText.svelte';
    import Snow from '../Effects/Snow.svelte';

    let clickedItem = false;
    let clickCanvas;
    let plateRef;

    function clickItem(event) {
        const { clickValue, isCrit } = game.clickItem();

        const x = event.clientX + Math.floor(Math.random() * 31) - 10;
        const y = event.clientY - 10;

        clickCanvas.spawn(
            x,
            y,
            `+${displayNumber(clickValue)}`,
            isCrit
        );

        clickedItem = true;
        setTimeout(() => clickedItem = false, 250);
    }
</script>

<div id="plate" transition:fly={{ x: 300, duration: 300 }} style="background: url('./img/{$theme.code}/bg/{$game.seasonId}.png') no-repeat center center/cover;">
    {#if game.GOD_MODE}
        <button class="resetbtn" on:click={game.resetGame}>Reset Game</button>
    {/if}
    <div id="item-container">
        <button class="no-btn" on:click={clickItem} type="button" class:wiggle={clickedItem} id="item-button">
            <Item />
            <GodRays size={800} color="255,200,150" />
        </button>
        <Cursors />
    </div>
    <Stats />
    <Boost />
    <ClickText bind:this={clickCanvas} />
    <div bind:this={plateRef} style="position: absolute; width: 100%; height: 100%;">
        <!-- other plate content -->
        <GoldenItems plateEl={plateRef} />
    </div>
    <RainingItems />
    <Fluid />
    <div id="lighting-overlay"></div>
    {#if $game.seasonId == 1}
        <Rain />
    {:else if $game.seasonId == 4}
        <Snow />
    {/if}
</div>


<style>
    #plate {
        text-align: center;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    #item-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        display: inline-block;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    #item-button {
        cursor: pointer;
        z-index: 3;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 280px;
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

    .wiggle {
        transform: translate(-50%, -50%) scale(1.1);
        animation: wiggle 0.3s;
    }

    @keyframes wiggle {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); }
    }

    @media (max-width: 768px) {
        #item-button {
            width: 180px;
        }
        .wiggle {
            animation: wiggle 0.2s;
        }
    }
</style>