<script>
    import { fly } from 'svelte/transition';
    import { onMount, onDestroy } from 'svelte';
    import { theme } from '../../store/theme';
    import { displayMode } from "./../../store/display";
    import Augments from './Augments.svelte';
    import Upgrades from './Upgrades.svelte';

    let collapsed = false;
    let multiples = [1, 10, 100];
    let multiple = 1;

    function handleKeyDown(event) {
        if (event.key === "Shift") {
            multiple = multiples[2];
        }
        if (event.key === "Control") {
            multiple = multiples[1];
        }

        if ($displayMode === "desktop") {
            if (event.key === "Tab") {
                event.preventDefault();
                collapsed = !collapsed;
            }
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift") {
            multiple = multiples[0];
        }
        if (event.key === "Control") {
            multiple = multiples[0];
        }
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

{#if $displayMode === "desktop" && !collapsed}
    <div id="shop" class="cracked-border" transition:fly={{ x: 150, duration: 150 }} style="--bg: url('./img/{$theme.code}/textures/wood-vertical.png');">
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
        /* position: fixed; */
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
        background: var(--bg);
        filter: brightness(0.35);
        z-index: 0;
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
            height: 100%;
            position: fixed;
        }
        .header {
            flex-wrap: wrap;
            gap: 7px;
            padding: 8px;
        }
    }
</style>
