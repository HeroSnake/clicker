<script>
    import { fly } from 'svelte/transition';
    import { onMount, onDestroy } from 'svelte';
    import { displayMode } from "./../../store/display";
    import Upgrades from './Upgrades.svelte';
    import Buildings from './Buildings.svelte';
    import { game } from '../../store/game';
    import Button from '../Layout/Button.svelte';

    let amounts = [1, 10, 100];
    let amount = 1;

    // --- Keyboard controls ---
    function handleKeyDown(event) {
        if (event.key === "Shift") amount = amounts[2];
        if (event.key === "Control") amount = amounts[1];

        if ($displayMode === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                game.toggleShop();
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") amount = amounts[0];
    }

    // --- Mobile swipe controls ---
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 150;

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchEnd() {
        const deltaX = touchEndX - touchStartX;

        if (deltaX < -SWIPE_THRESHOLD && !$game.displayShop) {
            game.toggleShop();
        }
        if (deltaX > SWIPE_THRESHOLD && $game.displayShop) {
            game.toggleShop();
        }

        touchStartX = 0;
        touchEndX = 0;
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Mobile swipe events
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);

        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    });
</script>

{#if $game.displayShop}
    <div id="shop" class="cracked-border" transition:fly={{ x: 150, duration: 150 }}>
        <div class="header">
            {#each amounts as m}
                <Button selected={m == amount} onclick={() => amount = m}>
                    <span>{m}</span>
                </Button>
            {/each}
        </div>

        <Upgrades />
        <Buildings {amount} />
    </div>
{/if}

<style>
    #shop {
        z-index: 2;
        width: 480px;
        padding: 10px;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('./img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .header {
        display: flex;
        flex-direction: row;
        padding: 10px;
        gap: 10px;
        align-items: center;
        position: sticky;
        top: 0;
        width: 100%;
        z-index: 1;
    }

    @media (max-width: 768px) {
        #shop {
            width: 100%;
            position: fixed;
        }
        .header {
            flex-wrap: wrap;
            gap: 7px;
            padding: 8px;
        }
    }
</style>
