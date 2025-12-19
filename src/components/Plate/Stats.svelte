<script>
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
</script>


<div id="stats">
    <span class="item-count">
        <b>{displayNumber($game.itemCount, true)}</b> {$theme.name}s
    </span>
    <span>
        <b>{displayNumber($game.production, true, true)}</b>
        <small>per second</small>
    </span>
    <div>
        {#if game.GOD_MODE}
            <button on:click={game.resetGame}>Reset Game</button>
        {/if}
        {#if theme.CHOOSABLE_THEME}
            <button on:click={() => theme.chooseTheme('banana')}>Banane</button>
            <button on:click={() => theme.chooseTheme('acorn')}>Gland</button>
        {/if}
    </div>
</div>

<style>
    #stats {
        color: #fff;
        position: absolute;
        top: 10vh;
        width: 100%;
        background-color: #0000007d;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px;
        gap: 5px;
    }
    .item-count {
        font-size: 24px;
    }
</style>