<script>
    import { game } from "../../../store/game";
</script>

<button id="toggle-settings" type="button" onclick={() => game.toggleSettings()} class:active={$game.displaySettings} aria-label="Settings"></button>

<style>
    #toggle-settings {
        background: url('/img/quick-access/settings.png');
        background-size: cover;
    }

    #toggle-settings:hover, #toggle-settings.active {
        filter: brightness(1.5);
        transition: brightness 0.15s;
    }
</style>