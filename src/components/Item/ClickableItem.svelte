<script>
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
    import Cursors from "../Item/Cursors.svelte";
    import Item from '../Item/Item.svelte';
    import ClickText from '../Effects/ClickText.svelte';

    let clickedItem = false;
    let clickCanvas;

    // Click rate limit
    const CLICK_INTERVAL = 1000 / 20; // 20 clicks per second
    let lastClickTime = 0;

    function clickItem(event) {
        // Only allow real mouse clicks
        if (!event.isTrusted) return;   // ignore synthetic events
        if (event.detail === 0) return; // ignore keyboard-triggered clicks

        const now = performance.now();
        if (now - lastClickTime < CLICK_INTERVAL) return; // enforce rate limit
        lastClickTime = now;

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

<div id="item-container">
    <button  id="item-button" class="no-btn" on:click={clickItem}  type="button"  class:wiggle={clickedItem}>
        <Item />
    </button>
    <Cursors />
</div>
<ClickText bind:this={clickCanvas} />

<style>
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
        z-index: 2;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 280px;
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
