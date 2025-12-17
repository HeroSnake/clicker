<script>
    import { fly } from 'svelte/transition';
    import { displayNumber, enhancementCost, enhancedUpgradeCost, upgradeCost } from "./../utils";
    import { game } from "./../store/game";
    import { theme } from "./../store/theme";
    import Tooltip from './Tooltip.svelte';
    import Icon from 'svelte-awesome';
    import chevronLeft from 'svelte-awesome/icons/chevronLeft';
    import chevronRight from 'svelte-awesome/icons/chevronRight';
    import { onMount, onDestroy } from 'svelte';

    const ENHANCE_TRESHOLD = 10;

    let collapsed = false;
    let multiples = [1, 10, 100];
    let multiple = 1;

    function handleBuyUpgrade(upgrade) {
        game.buyUpgrade(upgrade.id, upgradeCost(upgrade, multiple), multiple);
    }

    function handleKeyDown(event) {
        if (event.key === "Shift") {
            multiple = multiples[2];
        }
        if (event.key === "Control") {
            multiple = multiples[1];
        }

        if (event.key === "Tab") {
            event.preventDefault();
            collapsed = !collapsed;
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift") {
            multiple = multiples[0];
        }
        if (event.key === "Control") {
            multiple = multiples[0];
        }
    }

    $: enhancedUpgrades = $game.upgrades.filter(upgrade => {
        if (upgrade.level === 0) return false;
        return upgrade.stock >= ENHANCE_TRESHOLD * upgrade.level;
    });

    $: upgrades = $game.upgrades.filter((upgrade, i, arr) => {
        const lastOwnedIdx = arr.map(u => u.stock >= 1).lastIndexOf(true);
        return upgrade.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
    });

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    });
</script>

{#if !collapsed}
<div class="shop-wrapper" transition:fly={{ x: 300, duration: 300 }}>
    <button class="no-btn collapse-btn" on:click={() => collapsed = !collapsed}>
        <span>
            <Icon data={collapsed ? chevronLeft : chevronRight}/>
        </span>
    </button>

    <div class="shop">
        <div class="header">
            <span class="title">SHOP</span>
            {#each multiples as m}
                <button class="{m == multiple ? 'selected' : ''}" on:click={() => multiple = m}>{m}</button>
            {/each}
        </div>

        <div class="augments">
            {#each enhancedUpgrades as u}
                <Tooltip upgrade={u} {multiple} type="enhancedUpgrade" position="bottom">
                    <button
                        type="button"
                        class="no-btn augment"
                        on:click={() => game.enhanceUpgrade(u.id)}
                        disabled="{u.stock == 0 || enhancedUpgradeCost(u) > $game.itemCount}"
                        style="background-image: url('./img/upgrades/{$theme.code}/{u.id}.png'); background-size: cover; filter: saturate({1 + (u.level ?? 0) * 0.15});"
                    >
                    </button>
                </Tooltip>
            {/each}

            {#each $game.enhancements as u}
                <Tooltip upgrade={u} {multiple} type="enhancement" position="bottom">
                    <button
                        type="button"
                        class="no-btn augment"
                        on:click={() => game.buyEnhancement(u.id)}
                        disabled={enhancementCost(u) > $game.itemCount}
                        style="background-image: url('./img/items/{$theme.code}-gold.png'); background-size: cover;"
                    >
                        <small>{u.level}</small>
                    </button>
                </Tooltip>
            {/each}
        </div>

        <div class="upgrades">
            {#each upgrades as u, i}
                <Tooltip upgrade={u} {multiple} type="upgrade" position="bottom">
                    <button class="no-btn upgrade" on:click={() => handleBuyUpgrade(u)} disabled={upgradeCost(u, multiple) > $game.itemCount || upgrades[i -1]?.stock == 0}>
                        <div class="flex">
                            <div class="upgrade-img" style="background-image: url('./img/upgrades/{$theme.code}/{u.id}.png');"></div>
                            <div class="upgrade-data">
                                <span class="name">{game.getUpgrade(u).name}</span>
                                <span class="cost">
                                    <img src="./img/items/{$theme.code}-sm.png" alt="currency">
                                    <span class="value">{displayNumber(upgradeCost(u, multiple), true)}</span>
                                </span>
                            </div>
                        </div>
                        <span class="upgrade-stock">{u.stock}</span>
                    </button>
                </Tooltip>
            {/each}
        </div>
    </div>
</div>
{:else}
<div class="shop-wrapper-collapse" transition:fly={{ x: 300, duration: 300 }}>
    <button class="no-btn collapse-btn alone" on:click={() => collapsed = !collapsed}>
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
    z-index: 1;
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
.augments {
    display: flex;
    gap: 1px;
    flex-wrap: wrap;
}
.augment {
    width: 50px;
    height: 50px;
    position: relative;
    cursor: pointer;
    border: 3px solid #e48900b9;
    background-color: #272727;
}
.upgrades {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 5px;
}
.upgrade {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    background-color: #353430;
}
.augment:hover:not(:disabled), .upgrade:hover:not(:disabled) {
    background-color: #666561;
}
.augment:disabled, .upgrade:disabled {
    filter: grayscale(100) brightness(0.8);
    cursor: auto;
}
.augment small {
    position: absolute;
    top: 2px;
    right: 5px;
    color: #fff;
    text-shadow: 0px 0px 5px rgb(0, 0, 0);
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
</style>
