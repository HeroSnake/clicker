<script>
    import { onMount, onDestroy } from 'svelte';
    import { game } from "./store/game";
    import Header from "./components/Layout/Header.svelte";
    import Plate from "./components/Layout/Plate.svelte";
    import Shop from "./components/Shop/Shop.svelte";

    // --- Mobile swipe controls ---
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 100;

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
        // Mobile swipe events
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
    });

    onDestroy(() => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    });
</script>

<Header />
<div id="game">
    <Plate />
    <Shop />
</div>

<style>
    #game {
        height: calc(100% - 70px);
        display: flex;
    }
</style>
