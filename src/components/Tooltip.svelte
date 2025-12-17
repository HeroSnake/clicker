<script>
    import { onMount,tick } from 'svelte';
    import { displayNumber, enhancementCost, enhancedUpgradeCost, upgradeCost } from "./../utils";
    import { game } from "./../store/game";
    import { theme } from "./../store/theme";

    export let type = '';
    export let upgrade = {};
    export let multiple = 1;
    export let position = 'bottom'; // top, bottom, left, right
    export let offset = 1; // spacing in px

    let visible = false;
    let tooltipEl;
    let targetEl;

    let x = 0;
    let y = 0;

    async function handleMouseEnter(event) {
      visible = true;
      targetEl = event.currentTarget;
      await tick();
      setPosition();
    }

    function handleMouseLeave() {
      visible = false;
    }

    function setPosition() {
        if (!tooltipEl || !targetEl) return;

        const targetRect = targetEl.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();

        switch (position) {
            case 'top':
                x = targetRect.left + targetRect.width / 2;
                y = targetRect.top - tooltipRect.height - offset;
                break;
            case 'bottom':
                x = targetRect.left + targetRect.width / 2;
                y = targetRect.bottom + offset;
                break;
            case 'left':
                x = targetRect.left - tooltipRect.width - offset;
                y = targetRect.top + targetRect.height / 2;
                break;
            case 'right':
                x = targetRect.right + offset;
                y = targetRect.top + targetRect.height / 2;
                break;
        }
    }

    // Recalculate on window resize
    onMount(() => {
      const resizeListener = () => setPosition();
      window.addEventListener('resize', resizeListener);
      return () => window.removeEventListener('resize', resizeListener);
    });
</script>

<button class="no-btn" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
    <slot></slot>
</button>

{#if visible}
    <div bind:this={tooltipEl} class="tooltip"
        style="top: {y}px;
            left: {x}px;
            transform: translate(
            {position === 'left' ? '-100%' : position === 'right' ? '0%' : '-50%'},
            {position === 'top' ? '-100%' : position === 'bottom' ? '0%' : '-50%'}
        );"
    >
        {#if type === "enhancedUpgrade"}
            {#if upgrade.type === "cursor"}
                <span style="color:green;">+50%</span> {game.getUpgrade(upgrade).name} efficiency <br>
            {:else}
                <span style="color:green;">Double</span> {game.getUpgrade(upgrade).name} efficiency <br>
            {/if}
            <small class="cost">
                <img src="./img/items/{$theme.code}-sm.png" alt="img"> {displayNumber(enhancedUpgradeCost(upgrade))}
            </small>
        {:else if type === "enhancement"}
            <span style="color:green;">+{upgrade.increase}%</span> {upgrade.description} <br>
            <small class="cost">
                <img src="./img/items/{$theme.code}-sm.png" alt="img"> {displayNumber(enhancementCost(upgrade))}
            </small>
        {:else if type === "upgrade"}
            {game.getUpgrade(upgrade).description} <br>
            <small>
                each {game.getUpgrade(upgrade).name} produces {displayNumber(game.getUpgradeStats(upgrade, $game.itemsPerSecond).ips)} per second
            </small><br>
            <small>
                {upgrade.stock} {game.getUpgrade(upgrade).name}s produces a total of {displayNumber(game.getUpgradeStats(upgrade, $game.itemsPerSecond).ips * upgrade.stock)} per second
            </small><br>
            <small class="cost">
                <img src="./img/items/{$theme.code}-sm.png" alt="img"> {displayNumber(upgradeCost(upgrade, multiple))}
            </small>
        {/if}
    </div>
{/if}

<style>
    .tooltip {
        position: fixed;
        pointer-events: none;
        background: rgba(0,0,0,0.85);
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 1000;
    }
</style>
