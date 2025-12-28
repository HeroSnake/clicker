<script>
    import { onMount, onDestroy } from 'svelte';
	import { fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { game } from "./store/game";
    import { display } from './store/display';
    import Header from "./components/Layout/Header.svelte";
    import Plate from './components/Layout/Plate/Plate.svelte';
    import Shop from './components/Layout/Shop/Shop.svelte';
    import { achievements } from './store/achievements';
    import Dashboard from './components/Layout/Dashboard/Dashboard.svelte';
    import Popup from './components/Layout/Popup.svelte';

    // --- Mobile swipe controls ---
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 120;

    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchEnd() {
        const deltaX = touchEndX - touchStartX;

        // swipe to the left <--
        if (deltaX < -SWIPE_THRESHOLD) {
            if (!$game.displayShop && !$game.displayDashboard) {
                game.toggleShop();
            } else if ($game.displayDashboard) {
                game.toggleDashboard();
            }
        }

        // swipe to the right -->
        if (deltaX > SWIPE_THRESHOLD) {
            if ($game.displayShop) {
                game.toggleShop();
            } else if (!$game.displayDashboard) {
                game.toggleDashboard();
            }
        }

        touchStartX = 0;
        touchEndX = 0;
    }

    // --- Keyboard controls ---
    function handleKeyDown(event) {
        if (event.key === "Shift") game.setAmount($game.amounts[2]);
        if (event.key === "Control") game.setAmount($game.amounts[1]);

        if ($display.device === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                game.toggleDashboard();
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") game.setAmount($game.amounts[0]);
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

<Header />
<div id="game">
    <Plate />
    <Dashboard />
    <Shop />
    <div id="popup-container">
        {#each $achievements.newlyUnlocked as id (id)}
            <div
                in:fly={{ y: 40, duration: 200 }}
                out:fly={{ y: 40, duration: 200 }}
                animate:flip={{ duration: 200 }}
            >
                <Popup data={$achievements.list.find(a => a.id === id)} onClick={() => achievements.clear(id)}>
                </Popup>
            </div>
        {/each}
    </div>
</div>

<style>
    #game {
        height: calc(100% - 70px);
        display: flex;
        z-index: 3;
        position: relative;
    }

    #popup-container {
        position: absolute;
        bottom: 0;
        left: 50%;
        z-index: 2;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    @media (max-width: 768px) {
        #popup-container {
            width: 80%;
            bottom: 5px;
        }
    }
</style>
