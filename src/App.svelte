<script>
    import Items from "./Items.svelte";
    import Shop from "./Shop.svelte";
    import Cursors from "./Cursors.svelte";
    import Fluid from "./Fluid.svelte";
    import { onMount } from "svelte";
    import themes from "../src/assets/themes.json";
    import { displayNumber } from "../src/utils";

    import { game } from "./store/game";

    let theme = themes.find(t => t.id == +localStorage.getItem("theme")) || themes[0];
    let clickedItem = false;
    let cursors = [];


    function chooseTheme(idTheme) {
        theme = themes.find(t => t.id == idTheme)
        localStorage.setItem("theme", "" + idTheme)
    }

    onMount(() => {
        const saveInterval = setInterval(game.saveData, 2000);
        return () => clearInterval(saveInterval);
    });

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

<div id="plate">
    <h1 id="plate-title">{theme.name} Clicker</h1>

    <button id="item-container" class:wiggle={clickedItem} on:click={clickItem}>
        <img src="./img/items/{theme.img}" alt="item" id="item-img" />
        <Cursors bind:cursors />
    </button>
    <div class="lighting-overlay"></div>
    <Items {theme}/>
    <Fluid {theme}/>

    <hr>
    <div id="plate-info">
        <span class="item-count">
            {displayNumber($game.itemCount)} <strong>{theme.name}s</strong>
        </span><br>
        <small>
            {displayNumber($game.itemsPerSecond)} <strong>Bps</strong>
        </small>
        <br>
        <button on:click={game.resetGame}>Reset Game</button>
        <button on:click={() => chooseTheme(1)}>Banane</button>
        <button on:click={() => chooseTheme(2)}>Gland</button>
    </div>
</div>
<Shop {theme} />
<style>
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
        width: 60%;
        background: url('/img/bg/banana.jpg') no-repeat center center fixed;
        background-size: cover;
    }

    #item-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        display: inline-block;
        cursor: pointer;
        margin-bottom: 50px;
        width: fit-content;
        height: fit-content;
        touch-action: none;
        position: relative;
    }

    #plate-info, #item-container, #plate-title {
        z-index: 1;
    }

    .item-count {
        font-size: 24px;
    }

    .wiggle {
        animation: wiggle 0.3s;
    }

    @keyframes wiggle {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }

    #item-container {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
    }

    #item-img {
        height: 300px;
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
