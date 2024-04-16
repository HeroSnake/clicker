<script>
    import Items from "./Items.svelte";
    import Inventory from "./Inventory.svelte";
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
    let clickedCookie = false;
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
            setTimeout(() => {
                clickText.remove();
            }, 500);
            clickedCookie = true;
            setTimeout(() => {
                clickedCookie = false;
            }, 500);
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
    <h1>{theme.name} Clicker</h1>

    <div id="cookie-container" class:wiggle={clickedCookie} on:click={clickItem}>
        <img src="src/img/{theme.img}" alt="Cookie" height="200" />
    </div>

    <Cursors bind:cursors bind:upgrades />
    <hr>
    <div>
        <span class="cookie-count">
            {displayNumber(itemCount)} <strong>itemCount</strong>
        </span><br>
        <small>
            {displayNumber(itemsPerSecond)} <strong>Bps</strong>
        </small>
    </div>
    <button on:click={resetGame}>Reset Game</button>

    <button on:click={() => chooseTheme(1)}>Banane</button>
    <button on:click={() => chooseTheme(2)}>Gland</button>
</div>

<Inventory bind:itemCount bind:upgrades bind:itemsPerClick />
<Items bind:itemsPerSecond {theme}/>
<Fluid {theme} {upgrades}/>
<style>
    #plate {
        width: fit-content;
        text-align: center;
        position: relative;
        z-index: 1;
        margin: auto;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }

    #cookie-container {
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
    }

    .cookie-count {
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
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
