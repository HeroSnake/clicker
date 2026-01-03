<script>
    import { game } from "../../../store/game";
    import SettingsButton from "../Settings/SettingsButton.svelte";
</script>

<div id="quick-access">
    <button id="toggle-journal" type="button" onclick={() => game.toggleJournal()} class:active={$game.displayJournal} aria-label="Journal"></button>

    <SettingsButton />

    <button id="toggle-shop" type="button" onclick={() => game.toggleShop()} class:active={$game.displayShop} aria-label="Shop"></button>
</div>

<style>
    #quick-access {
        height: fit-content;
        z-index: 5;
        display: flex;
        justify-content: center;
        gap: 5px;
        background-image: url('/img/textures/wooden-logs-dark.png');
    }

    #quick-access button {
        width: 80px;
        height: 80px;
    }

    #quick-access button.active {
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

</style>