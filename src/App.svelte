<script>
    import Items from "./Items.svelte";
    import Shop from "./Shop.svelte";
    import Cursors from "./Cursors.svelte";
    import Fluid from "./Fluid.svelte";
    import { onMount } from "svelte";
    import gameData from "../src/assets/gameData.json";
    import themes from "../src/assets/themes.json";
    import { displayNumber } from "../src/utils";

    let itemCount = +localStorage.getItem("itemCount") || 0;
    let itemsPerSecond = +localStorage.getItem("itemsPerSecond") || 0;
    let totalItemsCollected = +localStorage.getItem("totalItemsCollected") || 0;
    let itemsPerClick = +localStorage.getItem("itemsPerClick") || 1;
    let theme = themes.find(t => t.id == +localStorage.getItem("theme")) || themes[0];
    let clickedItem = false;
    let cursors = [];

    let upgrades = JSON.parse(localStorage.getItem("upgrades")) ?? [...gameData]

    function resetGame() {
        localStorage.removeItem("itemCount");
        localStorage.removeItem("itemsPerSecond");
        localStorage.removeItem("itemsPerClick");
        localStorage.removeItem("totalItemsCollected");
        localStorage.removeItem("upgrades");
        upgrades = [...gameData]
        upgrades = upgrades
        itemsPerClick = 1;
        itemCount = itemsPerSecond = 0;
    }

    function chooseTheme(idTheme) {
        theme = themes.find(t => t.id == idTheme)
        localStorage.setItem("theme", "" + idTheme)
    }

    onMount(() => {
        const saveInterval = setInterval(saveData, 2000);
        return () => clearInterval(saveInterval);
    });

    function clickItem(event) {
        itemCount += itemsPerClick;
            const clickText = document.createElement('div');
            clickText.textContent = '+' + displayNumber(itemsPerClick);
            clickText.classList.add('click-text');
            clickText.style.left = event.clientX + 'px';
            clickText.style.top = event.clientY + 'px';
            document.body.appendChild(clickText);
            setTimeout(() => clickText.remove(), 500);
            clickedItem = true;
            setTimeout(() => clickedItem = false, 250);
    }

    function saveData() {
        localStorage.setItem("itemCount", "" + Math.floor(itemCount));
        localStorage.setItem("itemsPerSecond", "" + itemsPerSecond);
        localStorage.setItem("itemsPerClick", "" + itemsPerClick);
    }

    let generationInterval;
    function getItems() {
        generationInterval = setInterval(() => {
            let result = 0;
            upgrades
                .filter((u) => u.stock >= 1)
                .forEach((u) => {
                    switch (u.type) {
                        case "amount":
                        case "cursor":
                            result += u.increase * u.stock;
                            break;
                        case "percent":
                            result +=
                                itemsPerSecond *
                                (1 + (u.increase * u.stock) / 100);
                            break;
                    }
                });
            itemsPerSecond = result;
            itemCount += itemsPerSecond / 5;
            totalItemsCollected += itemsPerSecond / 5;
        }, 200);
    }
    getItems();
</script>

<div id="plate">
    <h1 id="plate-title">{theme.name} Clicker</h1>

    <button id="item-container" class:wiggle={clickedItem} on:click={clickItem}>
        <img src="./img/items/{theme.img}" alt="item" id="item-img" />
        <Cursors bind:cursors bind:upgrades />
    </button>
    <div class="lighting-overlay"></div>
    <Items {itemsPerSecond} {theme}/>
    <Fluid {theme} {upgrades}/>

    <hr>
    <div id="plate-info">
        <span class="item-count">
            {displayNumber(itemCount)} <strong>{theme.name}s</strong>
        </span><br>
        <small>
            {displayNumber(itemsPerSecond)} <strong>Bps</strong>
        </small>
        <br>
        <button on:click={resetGame}>Reset Game</button>
        <button on:click={() => chooseTheme(1)}>Banane</button>
        <button on:click={() => chooseTheme(2)}>Gland</button>
    </div>
</div>
<Shop bind:itemCount bind:upgrades bind:itemsPerClick {theme} />
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
