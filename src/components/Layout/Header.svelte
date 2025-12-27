<script>
    import { display } from "../../store/display";
    import { game } from "../../store/game";
    import Item from "../Item/Item.svelte";
    import Seasons from "./Plate/Seasons.svelte";
</script>

<div id="header">
    <Item mode="small" style="width:40px;" />
    <span class="title">Gland clicker</span>
    {#if game.GOD_MODE}
        <button class="resetbtn" onclick={game.resetGame}>Reset Game</button>
    {/if}
    <div class="header-right">
        <Seasons />
        {#if $display.device === "mobile"}
            <button
                onclick={() => game.toggleShop()}
                class="no-btn shop-btn interactive"
                aria-label="shop"
            ></button>
        {/if}
    </div>
</div>

<style>
    #header {
        display: flex;
        padding: 0 15px;
        align-items: center;
        position: relative;
        z-index: 3;
        gap: 20px;
        height: 70px;
    }

    #header::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('/img/textures/wooden-logs.png');
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

    .shop-btn {
        width: 50px;
        height: 50px;
        background: url('/img/shop/icon.png');
    }

    .shop-btn:hover {
        filter: brightness(1.5);
    }

    @media (max-width: 768px) {
        .title {
            display: none;
        }
        .shop-btn {
            width: 40px;
            height: 40px;
        }
    }
</style>
