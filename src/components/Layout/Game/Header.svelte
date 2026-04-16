<script>
    import { display } from "../../../store/display";
    import Item from "../../Item/Item.svelte";
    import SettingsButton from "../Settings/SettingsButton.svelte";
    import { game } from "../../../store/game";
</script>

<div id="header">
    <Item mode="small" style="width:40px;" />
    <span class="title">Gland clicker</span>
    {#if $display.device === "desktop"}
        <div class="actions">
            <button id="toggle-journal" type="button" onclick={() => game.toggleJournal()} class:active={$game.displayJournal} aria-label="Journal"></button>
            <button id="toggle-shop" type="button" onclick={() => game.toggleShop()} class:active={$game.displayShop} aria-label="Shop"></button>
            <SettingsButton />
        </div>
    {/if}
</div>

<style>
    .actions {
        display: flex;
        gap: 10px;
        margin-left: auto;
    }

    .actions button {
        width: 50px;
        height: 50px;
        background-size: cover;
        cursor: pointer;
    }

    .actions button:hover, .actions button.active {
        filter: brightness(1.5);
        transition: brightness 0.15s;
    }

    #toggle-journal {
        background: url('/img/quick-access/journal.png');
        background-size: cover;
    }

    #toggle-shop {
        background: url('/img/quick-access/shop.png');
        background-size: cover;
    }

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
</style>
