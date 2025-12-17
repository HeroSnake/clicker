<script>
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { fade, scale } from "svelte/transition";
    import { game } from "../store/game";
    import { theme } from "../store/theme";
    import Glow from "./Glow.svelte";
    import GodRays from "./GodRays.svelte";

    let visible = false;
    let x = 0;
    let y = 0;
    let despawnTimeout = null;

    const BASE_SPAWN_CHANCE = 0.1; // 0.1% per second
    const boostMultiplier = 5;
    const boostDuration = 5000;

    function spawn() {
        if (despawnTimeout) {
            clearTimeout(despawnTimeout);
            despawnTimeout = null;
        }

        x = Math.random() * (window.innerWidth - 50);
        y = Math.random() * (window.innerHeight - 50);
        visible = true;

        despawnTimeout = setTimeout(() => {
            visible = false;
            despawnTimeout = null;
        }, 7000);
    }

    function clickGoldenItem() {
        if (despawnTimeout) {
            clearTimeout(despawnTimeout);
            despawnTimeout = null;
        }

        game.boostProduction(boostMultiplier, boostDuration);
        visible = false;
    }

    onMount(() => {
        const interval = setInterval(() => {
            if (!visible) {
                const gameState = get(game);
                const enhancedSpawnChance = BASE_SPAWN_CHANCE * (1 + game.getEnhancementBonus(gameState, "spawnChance") / 100);

                if (Math.random() < enhancedSpawnChance) {
                    spawn();
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            if (despawnTimeout) clearTimeout(despawnTimeout);
        };
    });
  </script>

  {#if visible}
    <div style="position:absolute; left:{x}px; top:{y}px;" transition:fade={{ duration: 400 }}>
        <button
            class="golden-item"
            on:click={clickGoldenItem}
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && clickGoldenItem()}
            transition:scale={{ duration: 400, start: 0.5 }}
        >
            <Glow />
            <GodRays size={250} color="255,215,0" />
            <img src="./img/items/{$theme.code}-gold.png" alt="goldenItem" />
        </button>
    </div>
  {/if}

  <style>
    .golden-item {
        position: absolute;
        cursor: pointer;
        z-index: 1000;
        user-select: none;
        border: none;
        background: none;
        padding: 0;
        animation: bounce 1s infinite alternate;
    }

    .golden-item img {
        width: 50px;
    }

    /* Bounce animation (keep yours) */
    @keyframes bounce {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
    }
  </style>
