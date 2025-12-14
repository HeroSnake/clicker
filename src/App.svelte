<script>
    import RainingItems from "./RainingItems.svelte";
    import Shop from "./Shop.svelte";
    import GodRays from "./GodRays.svelte";
    import Cursors from "./Cursors.svelte";
    import Fluid from "./Fluid.svelte";
    import { theme } from "./store/theme";
    import { game } from "./store/game";
    import { displayNumber } from "../src/utils";

    let clickedItem = false;

    function clickItem(event) {
        game.clickItem()
        const clickText = document.createElement('div');
        clickText.textContent = '+' + displayNumber($game.itemsPerClick);
        clickText.classList.add('click-text');
        clickText.style.left = event.clientX + 'px';
        clickText.style.top = event.clientY + 'px';
        document.body.appendChild(clickText);
        setTimeout(() => clickText.remove(), 500);
        clickedItem = true;
        setTimeout(() => clickedItem = false, 250);
    }
</script>

<div id="game" style="background: url('/img/bg/{$theme.code}.jpg') no-repeat center center/cover;">
    <div id="plate">
        <div id="item-container">
            <button on:click={clickItem} type="button" class:wiggle={clickedItem} id="item-button">
                <img src="./img/items/{$theme.img}" alt="item" id="item-img" />
            </button>
            <GodRays />
            <Cursors />
        </div>
        <div class="lighting-overlay"></div>
        <RainingItems/>
        <Fluid/>

        <hr>
        <div id="plate-info">
            <h1 id="plate-title">{$theme.name} Clicker</h1>
            <span class="item-count">
                {displayNumber($game.itemCount, true)} <strong>{$theme.name}s</strong>
            </span><br>
            <small>
                {displayNumber($game.itemsPerSecond, true)} <strong>{$theme.unit}ps</strong>
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
    </div>
    <Shop/>
</div>

<style>
    #game {
        display: flex;
        width: 100%;
    }
    #plate {
        width: fit-content;
        text-align: center;
        position: relative;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 100%;
        background-size: cover;
    }
    #item-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        display: inline-block;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
        margin-top: 15%;
    }
    #plate-info, #item-container {
        z-index: 1;
    }
    #plate-info {
        color: #000;
        position: absolute;
        bottom: 5%;
    }
    #item-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        z-index: 1;
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #item-img {
        height: 300px;
        display: block;
    }
    .item-count {
        font-size: 24px;
    }
    .wiggle {
        animation: wiggle 0.3s;
    }
    #item-button.wiggle {
        transform: translate(-50%, -50%) scale(1.05);
        animation: wiggle 0.3s;
    }
    @keyframes wiggle {
        0% {
            transform: translate(-50%, -50%) scale(1);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.05);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
        }
    }
    .lighting-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%);
    }

</style>
