<script>
    import { fly } from 'svelte/transition';
    import { onMount, onDestroy } from 'svelte';
    import { displayMode } from "./../../store/display";
    import Augments from './Augments.svelte';
    import Upgrades from './Upgrades.svelte';
    import { game } from '../../store/game';

    let multiples = [1, 10, 100];
    let multiple = 1;

    // --- Keyboard controls ---
    function handleKeyDown(event) {
        if (event.key === "Shift") multiple = multiples[2];
        if (event.key === "Control") multiple = multiples[1];

        if ($displayMode === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                game.toggleShop();
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") multiple = multiples[0];
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
            {#each multiples as m}
                <button class="{m == multiple ? 'selected' : ''}" on:click={() => multiple = m}>{m}</button>
            {/each}
        </div>

        <Augments />
        <Upgrades {multiple} />
    </div>
{/if}

<style>
    #shop {
        width: 480px;
        height: 100vh;
        overflow-x: hidden;
        z-index: 2;
        top: 0;
        right: 0;
        overflow-y: scroll;
        padding: 6px;
        position: relative;
    }
    #shop::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('./img/textures/wood-vertical.png');
        filter: brightness(0.35);
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }
    .selected {
        box-shadow: 0 0 8px 3px #fff, 0 0 14px 3px #ffe56666;
        background: #353430;
        border-radius: 6px;
        border: 1.5px solid #fff;
        transition: box-shadow 0.15s, background 0.15s;
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
        z-index: 2;
    }
    @media (max-width: 768px) {
        #shop {
            width: 100%;
            position: fixed;
            top: auto;
            right: auto;
        }
        .header {
            flex-wrap: wrap;
            gap: 7px;
            padding: 8px;
        }
    }
</style>
