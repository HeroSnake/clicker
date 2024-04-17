<script>
    import { displayNumber } from "./utils"
    export let itemCount, upgrades, itemsPerClick

    const MAX_LEVELS = 30

    function buyUpgrade(id) {
        let upgrade = upgrades.find(u => u.id == id)
        if (itemCount >= upgrade.cost) {
            if(upgrade.type == 'cursor') {
                itemsPerClick += upgrade.increase
                localStorage.setItem('itemsPerClick', itemsPerClick)
            }
            upgrade.stock++
            itemCount -= Math.floor(upgrade.cost)
            upgrade.cost *= 3
            upgrades = upgrades
            localStorage.setItem('upgrades', JSON.stringify(upgrades))
        }
    }

    function enhanceUpgrade(id) {
        let upgrade = upgrades.find(u => u.id == id)
        if (upgrade.level < MAX_LEVELS && itemCount >= (upgrade.baseCost * Math.exp(upgrade.level))) {
            itemCount -= upgrade.baseCost * Math.exp(upgrade.level)
            upgrade.level++
            switch (upgrade.type) {
                default:
                    upgrade.increase *= 2
                    break;
            }
            console.log(upgrade)
            upgrades = upgrades
            localStorage.setItem('upgrades', JSON.stringify(upgrades))
        }
    }

    function upgradeInfo(type) {
        switch (type) {
            case 'percent':
                return '% Bps'
            case 'amount':
                return ' Bps'
            case 'cursor':
                return ` Bps <strong>(${displayNumber(itemsPerClick)} Bpc)</strong>`
        }
    }
</script>

<div class="shop">
    <h2>Shop</h2>
    <div class="upgrades">
        {#each upgrades as upgrade}
            <div class="upgrade">
                <div class="upgradeInfo {upgrade.stock == 0 ? 'locked' : ''}">
                    <div class="flex">
                        <div class="upgradeImg">
                            <img src="./img/upgrades/{upgrade.image}.png" alt="img">
                            <span class="upgradeStock">x{upgrade.stock}</span>
                        </div>
                        <div>
                            <strong>{upgrade.name} </strong><br>
                            <small>+{displayNumber(upgrade.increase)} {@html `${upgradeInfo(upgrade.type)}`}</small>
                        </div>
                    </div>
                    {#if upgrade.stock > 0}
                        <div class="upgradeLevel">
                            <div class="xp-bar">
                                <div class="fill" style="width: {upgrade.stock == 0 ? 0 : upgrade.level / MAX_LEVELS * 100}%"></div>
                            </div>
                            <span>{upgrade.level}</span>
                        </div>
                    {/if}
                </div>
                <div class="flex-c upgradeButtons">
                    <button class="shop-btn" on:click={() => buyUpgrade(upgrade.id)} disabled="{Math.floor(upgrade.cost) > Math.floor(itemCount)}">
                        <span>Buy</span><br>
                        <small>{displayNumber(upgrade.cost)}<img src="./img/items/banana.png" alt="banana"></small>
                    </button>
                    {#if upgrade.level < MAX_LEVELS}
                        <button class="shop-btn" on:click={() => enhanceUpgrade(upgrade.id)} disabled="{upgrade.stock == 0 || Math.floor(upgrade.baseCost * Math.exp(upgrade.level)) > Math.floor(itemCount)}">
                            <span>Up</span><br>
                            <small>{displayNumber(upgrade.baseCost * Math.exp(upgrade.level))}<img src="./img/items/banana.png" alt="banana"></small>
                        </button>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .shop {
        border-left: 2px solid #333;
        background-color: #242424;
        width: 40%;
        height: 100vh;
        overflow-y: scroll;
        z-index: 1;
    }

    .upgrades {
        display: flex;
        flex-direction: column;
        border-top: 1px solid rgb(129, 129, 129);
        height: 100%;
    }

    .flex {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
    }

    .flex-c {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .upgradeImg {
        position: relative;
        width: 50px;
    }
    .upgradeImg img {
        width: 100%;
    }

    .upgrade {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgb(129, 129, 129);
        padding: 5px 20px;
        gap: 20px;
    }

    .upgradeInfo {
        width: 100%;
    }

    .upgradeLevel {
        display: flex;
        align-items: center;
    }

    .upgradeLevel > span {
        border: 1px solid;
        width: 26px;
        height: 26px;
        text-align: center;
    }

    .upgradeButtons {
        position: relative;
    }

    .shop-btn {
        background-color: #4caf50;
        color: white;
        padding: 10px;
        border: none;
        cursor: pointer;
        width: 95px;
    }

    .shop-btn:not(:disabled)::after{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        border-radius: 50%;
        animation: rotateGlow 4s linear infinite; /* Adjust the duration and timing function as needed */
        box-shadow: 0 0 20px 10px rgba(0, 255, 0, 0.7); /* Adjust the color and blur radius as needed */
    }

    @keyframes rotateGlow {
        from {
            transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }

    .locked {
        opacity: 0.5;
    }

    .shop-btn:hover {
        background-color: #45a049;
    }

    .shop-btn:disabled {
        background-color: #7f7f7f;
        cursor: not-allowed;
    }

    .shop-btn img {
        height: 14px;
    }

    .xp-bar {
        width: 100%;
        height: 9px;
        overflow: hidden;
        border: 1px solid;
        border-right: none;
    }

    .fill {
        height: 100%;
        background: #f4e800;
        transition: width 0.5s ease;
    }

    .upgradeStock {
        position: absolute;
        bottom: 0;
        right: 0;
        border-radius: 5px;
        width: 23px;
        height: 18px;
        font-size: 12px;
        text-align: center;
        font-weight: bold;
        color: #f4e800;
        background: #2d2d2d;
    }
</style>
