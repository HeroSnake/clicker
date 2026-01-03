<script>
    import { onMount, onDestroy } from 'svelte';
    import { game } from "./store/game";
    import { display } from './store/display';
    import Header from './components/Layout/Game/Header.svelte';
    import QuickAccess from './components/Layout/Game/QuickAccess.svelte';
    import Game from './components/Layout/Game/Game.svelte';
    import Amounts from './components/Layout/Game/Amounts.svelte';

    // --- Keyboard controls ---
    function handleKeyDown(event) {
        if (event.key === "Shift") game.setAmount($game.amounts[2]);
        if (event.key === "Control") game.setAmount($game.amounts[1]);

        if ($display.device === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                game.toggleSettings();
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") game.setAmount($game.amounts[0]);
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    });
</script>

<Header />
<Game />
<Amounts />
{#if $display.device === "mobile"}
    <QuickAccess />
{/if}

<style>
</style>
