<script>
    import { theme } from "../store/theme";
    import { game } from "../store/game";
    import { displayNumber } from "../utils";
</script>


<div id="stats">
    <span class="item-count">
        {displayNumber($game.itemCount, true)} <strong>{$theme.name}s</strong>
    </span><br>
    <small>
        {displayNumber($game.itemsPerSecond, true)} <strong>{$theme.unit}ps</strong>
    </small><br>
    <small>
        {displayNumber($game.critChance * 100)}% <strong>Crit chance</strong>
    </small><br>
    <small>
        {displayNumber($game.critMultiplier, true)} <strong>Crit multiplier</strong>
    </small>
    <br>
    {#if game.GOD_MODE}
        <button on:click={game.resetGame}>Reset Game</button>
    {/if}
    {#if theme.CHOOSABLE_THEME}
        <button on:click={() => theme.chooseTheme('banana')}>Banane</button>
        <button on:click={() => theme.chooseTheme('acorn')}>Gland</button>
    {/if}
</div>

<style>
    #stats {
        color: #fff;
        position: absolute;
        top: 10vh;
        width: 100%;
        background-color: #0000007d;
    }
    .item-count {
        font-size: 24px;
    }
</style>