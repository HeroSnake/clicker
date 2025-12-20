<script>
    import Item from "../Item/Item.svelte";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
</script>

<div id="header" style="--bg: url('/img/{$theme.code}/textures/wooden-logs.png')">
    <Item mode="small" style="width: 40px;" />
    <span class="title">{$theme.name} clicker</span>
    <div class="seasons">
        {#each $game.seasons as season}
            <button
                on:click={() => game.setSeason(season.id)}
                class="no-btn season-btn interactive"
                aria-label="season"
                style="--bg: url('./img/seasons/{season.id}.png');"
            >
            </button>
        {/each}
    </div>
</div>

<style>
    #header {
        display: flex;
        padding: 15px;
        align-items: center;
        position: relative;
        z-index: 2;
        gap: 20px;
    }
    #header::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--bg);
        filter: brightness(0.65);
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }
    .title {
        text-transform: uppercase;
        font-size: 1.8rem;
    }
    .seasons {
        display: flex;
    }
    .season-btn {
        width: 80px;
        height: 60px;
        background: var(--bg);
    }
</style>