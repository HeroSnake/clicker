<script>
    import Item from "../Item/Item.svelte";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import Seasons from "./Seasons.svelte";
</script>

<div id="header">
    <Item mode="small" style="width:40px;" />
    <span class="title">{$theme.name} clicker</span>
    <div class="header-right">
        <Seasons />
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