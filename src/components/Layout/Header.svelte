<script>
    import Item from "../Item/Item.svelte";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
</script>

<div id="header">
    <Item mode="small" style="width:40px;" />
    <span class="title">{$theme.name} clicker</span>
    <div class="header-right">
        <div class="seasons">
            {#each $game.seasons as season}
                <button
                    on:click={() => game.setSeason(season.id)}
                    class="no-btn season-btn interactive"
                    aria-label="season"
                    style="background: url('./img/seasons/{season.id}.png');"
                    disabled={season.id == 2}
                ></button>
            {/each}
        </div>
        <button
            on:click={() => game.toggleShop()}
            class="no-btn shop-btn interactive"
            aria-label="shop"
        ></button>
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
        background: url('./img/textures/wooden-logs.png');
        filter: brightness(0.65);
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .title {
        text-transform: uppercase;
        font-size: 1.8rem;
    }

    .header-right {
        margin-left: auto; /* pushes this group to the right */
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .seasons {
        display: flex;
        gap: 5px;
    }

    .shop-btn {
        width: 50px;
        height: 50px;
        background: url('./img/shop/icon.png');
    }

    .shop-btn:hover {
        filter: brightness(1.5);
    }

    .season-btn {
        width: 50px;
        height: 50px;
        border: 2px solid #000;
        box-shadow: 0 0 12px 3px #000, 0 0 7px 2px #fff3;
    }

    @media (max-width: 768px) {
        .title {
            display: none;
        }
        .shop-btn, .season-btn {
            width: 40px;
            height: 40px;
        }
    }
</style>