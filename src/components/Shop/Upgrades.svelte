<script>
    import { getUpgradeCost } from "../../utils";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import Tooltip from './Tooltip.svelte';
    import Cost from "./Cost.svelte";

    export let multiple = 1;

    $: upgrades = $game.upgrades.filter((upgrade, i, arr) => {
        const lastOwnedIdx = arr.map(u => u.stock >= 1).lastIndexOf(true);
        return upgrade.stock >= 1 || (i > lastOwnedIdx && i <= lastOwnedIdx + 2);
    });

    function handleBuyUpgrade(upgrade) {
        game.buyUpgrade(upgrade.id, getUpgradeCost(upgrade, multiple), multiple);
    }

</script>


<div class="upgrades">
    {#each upgrades as upgrade, i}
        <Tooltip {upgrade} cost={getUpgradeCost(upgrade, multiple)} type="upgrade">
            <button class="no-btn upgrade" on:click={() => handleBuyUpgrade(upgrade)} disabled={getUpgradeCost(upgrade, multiple) > $game.itemCount || upgrades[i -1]?.stock == 0}>
                <div class="flex">
                    <div class="upgrade-img" style="background-image: url('./img/upgrades/{$theme.code}/{upgrade.id}.png');"></div>
                    <div class="upgrade-data">
                        <span class="name">{upgrade.name}</span>
                        <Cost value={getUpgradeCost(upgrade, multiple)} />
                    </div>
                </div>
                {#if upgrade.stock > 0}
                    <span class="stock">{upgrade.stock}</span>
                {/if}
            </button>
        </Tooltip>
    {/each}
</div>

<style>
    .flex {
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
    }
    .upgrades {
        display: flex;
        flex-direction: column;
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
    .upgrade:hover:not(:disabled) {
        background-color: #666561;
    }
    .upgrade:disabled {
        filter: grayscale(100) brightness(0.8);
        cursor: auto;
    }
    .stock {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        font-size: 50px;
        text-align: center;
        font-weight: bold;
        right: 5px;
        z-index: 1;
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