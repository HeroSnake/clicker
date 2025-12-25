<script>
    import { fly } from 'svelte/transition';
    import { onMount, onDestroy } from 'svelte';
    import { display } from "./../../store/display";
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

        if ($display.device === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                game.toggleShop();
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") amount = amounts[0];
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

{#if $game.displayShop}
    <div id="shop" class="cracked-border" transition:fly={{ x: 150, duration: 150 }}>
        <div class="header">
            <div class="amounts">
                {#each amounts as m}
                    <Button selected={m == amount} onclick={() => amount = m}>
                        <span>{m}</span>
                    </Button>
                {/each}
            </div>
            <Upgrades />
        </div>

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
        background: url('/img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        background-size: contain;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .header {
        width: 100%;
        z-index: 1;
    }

    .amounts {
        display: flex;
        flex-direction: row;
        padding: 10px;
        gap: 10px;
        align-items: center;
    }

    @media (max-width: 768px) {
        #shop {
            height: calc(100dvh - 110px);
            width: calc(100% - 40px);
            position: fixed;
        }
        .header {
            flex-wrap: wrap;
            gap: 7px;
            padding: 8px;
        }
    }
</style>
