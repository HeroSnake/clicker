<script>
    import { fly } from 'svelte/transition';
    import { displayNumber } from "./../utils";
    import { game } from "./../store/game";
    import { theme } from "./../store/theme";
    import Icon from 'svelte-awesome';
    import chevronLeft from 'svelte-awesome/icons/chevronLeft';
    import chevronRight from 'svelte-awesome/icons/chevronRight';
    import { onMount, onDestroy } from 'svelte';

    const COST_MULT = 1.15;
    const ENHANCE_TRESHOLD = 50;

    let collapsed = false;
    let multiples = [1, 10, 100];
    let multipleBuy = 1;

    function upgradeCost(upgrade) {
        const n = multipleBuy;
        const s = upgrade.stock;

        return upgrade.cost *
            (Math.pow(COST_MULT, s) * (Math.pow(COST_MULT, n) - 1)) /
            (COST_MULT - 1);
    }

    function enhancementCost(upgrade) {
        return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.level));
    }

    function effectiveIncrease(upgrade) {
        return upgrade.increase * Math.pow(2, upgrade.level);
    }

    function upgradeName(upgrade) {
        if (upgrade.id < 3 || upgrade.stock >= 1) {
            return $theme.augments[upgrade.id]
        }
        return '???';
    }

    function handleKeydown(event) {
        if (event.key === "Tab") {
            event.preventDefault();
            collapsed = !collapsed;
        }
    }

    $: enhancedUpgrades = $game.upgrades.filter(upgrade => {
        return upgrade.stock >= ENHANCE_TRESHOLD * upgrade.level;
    });

    $: upgrades = $game.upgrades.filter((upgrade, i, arr) => {
        const lastOwnedIdx = arr.map(u => u.stock >= 1).lastIndexOf(true);
        return upgrade.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
    });

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeydown);
    });
</script>

{#if !collapsed}
<div class="shop-wrapper" transition:fly={{ x: 300, duration: 300 }}>
    <button class="collapse-btn" on:click={() => collapsed = !collapsed} aria-label="Toggle shop">
        <span>
            <Icon data={collapsed ? chevronLeft : chevronRight}/>
        </span>
    </button>

    <div class="shop">
        <div class="header">
            <span class="title">SHOP</span>
            {#each multiples as multiple}
                <button class="{multipleBuy == multiple ? 'selected' : ''}" on:click={() => multipleBuy = multiple}>{multiple}</button>
            {/each}
        </div>

        <div class="augments">
            {#each enhancedUpgrades as upgrade}
                <button
                    type="button"
                    class="augment-btn"
                    on:click={() => game.enhanceUpgrade(upgrade.id)}
                    disabled="{upgrade.stock == 0 || enhancementCost(upgrade) > $game.itemCount}"
                    style="background-image: url('./img/upgrades/{$theme.code}/{upgrade.id}.png'); background-size: cover; filter: saturate({1 + (upgrade.level ?? 0) * 0.15});"
                >
                    <!-- <small>Cost: {displayNumber(enhancementCost(upgrade))}</small> -->
                    <!-- <small>+{displayNumber(effectiveIncrease(upgrade))}</small> -->
                    <small>{upgrade.level}</small>
                </button>
            {/each}
        </div>

        <div class="upgrades">
            {#each upgrades as upgrade, i}
                <div class="upgrade">
                    <button class="upgrade-info" on:click={() => game.buyUpgrade(upgrade.id, upgradeCost(upgrade), multipleBuy)} disabled={upgradeCost(upgrade) > $game.itemCount || upgrades[i -1]?.stock == 0}>
                        <div class="flex">
                            <div
                                class="upgrade-img"
                                style="background-image: url('./img/upgrades/{$theme.code}/{upgrade.id}.png');"
                            ></div>
                            <div class="upgrade-data">
                                <span class="name">{upgradeName(upgrade)}</span>
                                {#if upgrade.stock > 0}
                                    <span class="increase">(lvl {upgrade.level})</span>
                                {/if}
                                <span class="cost">
                                    <img src="./img/items/{$theme.img}" alt="currency">
                                    <span class="value">{displayNumber(upgradeCost(upgrade), true)}</span>
                                    <span class="increase">
                                        +{displayNumber(effectiveIncrease(upgrade) * multipleBuy)} {$theme.unit}ps
                                    </span>
                                </span>
                            </div>
                        </div>
                        <span class="upgrade-stock">{upgrade.stock}</span>
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
{:else}
<div class="shop-wrapper-collapse" transition:fly={{ x: 300, duration: 300 }}>
    <button class="collapse-btn alone" on:click={() => collapsed = !collapsed} aria-label="Toggle shop">
        <span>
            <Icon data={collapsed ? chevronLeft : chevronRight}/>
        </span>
    </button>
</div>
{/if}

<style>
.selected {
    /* Glow effect for selected button */
    box-shadow: 0 0 8px 3px #fff, 0 0 14px 3px #ffe56666;
    background: #353430;
    border-radius: 6px;
    border: 1.5px solid #fff;
    transition: box-shadow 0.15s, background 0.15s;
}
.shop-wrapper {
    width: 60%;
    min-width: 230px;
}
.shop-wrapper-collapse {
    width: 12px;
}
.shop-wrapper, .shop-wrapper-collapse {
    background-color: #2e2e2eeb;
    position: relative;
    height: 100vh;
}
.collapse-btn {
    position: absolute;
    top: 10px;
    left: -11px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    outline: none;
    border: none;
    transform: rotate(45deg);
}

.collapse-btn span {
    transform: rotate(-45deg);
    position: absolute;
    top: 3px;
    right: 4px;
}
.augments {
    display: flex;
    gap: 1px;
    flex-wrap: wrap;
}
.augment-btn {
    width: 50px;
    height: 50px;
    position: relative;
}
.augment-btn:not(:disabled) {
    cursor: pointer;
}
.augment-btn:disabled, .upgrade-info:disabled {
    filter: grayscale(100) !important;
}
.augment-btn small {
    position: absolute;
    top: 2px;
    right: 5px;
    color: #fff;
    text-shadow: 0px 0px 5px rgb(0, 0, 0);
}
.alone {
    right: 0;
    left: auto;
}

.alone span {
    top: 5px;
    right: 6px;
}

.shop {
    background-color: #2e2e2eeb;
    height: 100%;
    overflow-y: auto;
    z-index: 1;
    position: relative;
}
.header {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    position: sticky;
    top: 0;
    width: 100%;
    z-index: 2;
    background-color: #2e2e2ed1;
}
.title {
    font-weight: bold;
    padding: 10px 20px;
    display: block;
}
.flex {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
}

.upgrade-info {
    width: 100%;
    cursor: pointer;
    border: none;
    position: relative;
    padding: 0;
}
.upgrade-img {
    min-width: 60px;
    height: 60px;
    background-size: cover;
}
.upgrade-data {
    width: 100%;
    text-align: left;
}
.name {
    font-size: 18px;
    font-weight: bold;
}
.cost {
    display: flex;
    align-items: center;
    gap: 5px;
}
.increase {
    opacity: 0.4;
    font-size: 8px;
}
.cost img {
    width: 15px;
}
.cost .value {
    font-size: 10px;
    font-weight: bold;
}
.upgrade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}
.upgrades {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.upgrade-stock {
    position: absolute;
    font-size: 50px;
    text-align: center;
    font-weight: bold;
    right: 5px;
    z-index: 1;
    top: 0;
    opacity: 0.1;
}
</style>
