<script>
    import { fly } from 'svelte/transition';
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
    import GodRays from "./../Effects/GodRays.svelte";
    import Cursors from "./../Item/Cursors.svelte";
    import Stats from './../Plate/Stats.svelte';
    import Item from './../Item/Item.svelte';
    import Boost from '../Effects/Boost.svelte';

    let clickedItem = false;

    function clickItem(event) {
        const { clickValue, isCrit } = game.clickItem();

        const clickText = document.createElement('div');
        clickText.textContent = `+${displayNumber(clickValue)}`;
        clickText.className = 'click-text';
        let top = event.clientY - 10;
        let left = event.clientX + Math.floor(Math.random() * 31) - 10;
        let timeout = 1500;

        if (isCrit) {
            clickText.className += ' crit';
            left += 30;
            timeout = 2500;
        }

        Object.assign(clickText.style, {
            left: left + 'px',
            top: top + 'px',
        });

        document.body.append(clickText);
        setTimeout(() => clickText.remove(), timeout);

        clickedItem = true;
        setTimeout(() => clickedItem = false, 250);
    }
</script>

<div id="plate" transition:fly={{ x: 300, duration: 300 }}>
    <div id="item-container">
        <button class="no-btn" on:click={clickItem} type="button" class:wiggle={clickedItem} id="item-button">
            <Item />
            <GodRays size={800} color="255,200,150" />
        </button>
        <Cursors />
    </div>
    <Stats />
    <Boost />
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
        background-size: cover;
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
        margin-top: 15%;
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
    #item-button:hover {
        transform: translate(-50%, -50%) scale(1.1);
        transition: transform 0.3s ease-in-out;
    }
    .wiggle {
        transform: translate(-50%, -50%) scale(1.1);
        animation: wiggle 0.3s;
    }
    @keyframes wiggle {
        0% {
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
        }
    }
    :global(.click-text) {
        position: absolute;
        font-size: 20px;
        font-weight: bold;
        color: white;
        text-shadow: 0 0 5px #000;
        pointer-events: none;
        user-select: none;
        transform: translate(-50%, -50%);
        animation: floatUp 1.5s ease-out forwards;
    }
    :global(.click-text.crit) {
        color: rgb(255, 136, 0);
        font-size: 26px;
        font-weight: bolder;
        text-shadow: 0 0 8px #000;
        animation: CritfloatUp 2.5s ease-out forwards;
        z-index: 3;
    }
    @keyframes floatUp {
        0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) translateY(-100px); opacity: 0; }
    }
    @keyframes CritfloatUp {
        0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
        100% { transform: translate(-50%, -50%) translateY(-150px); opacity: 0; }
    }
    @media (max-width: 768px) {
        #item-button {
            width: 180px;
        }
        .wiggle {
            /* keep wiggle on mobile a bit less aggressive */
            animation: wiggle 0.2s;
        }
        :global(.click-text) {
            font-size: 15px;
            text-shadow: 0 0 3px #000;
        }
        :global(.click-text.crit) {
            font-size: 19px;
            text-shadow: 0 0 5px #000;
        }
    }
</style>