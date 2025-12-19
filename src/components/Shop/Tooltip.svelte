<script>
    import { onMount, tick } from "svelte";
    import { displayNumber, getEnhancementCost, getBonusCost, getUpgradeCost } from "../../utils";
    import { game } from "../../store/game";
    import Cost from "./Cost.svelte";

    export let type = '';
    export let upgrade = {};
    export let cost = 0;
    export let offset = 8; // spacing from the shop

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

        const tooltipRect = tooltipEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // horizontal: always left of shop
        const shopEl = document.getElementById("shop");
        const shopRect = shopEl ? shopEl.getBoundingClientRect() : { left: window.innerWidth };
        x = shopRect.left - tooltipRect.width - offset;

        // vertical: aligned with hovered element
        y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;

        // clamp inside viewport
        x = Math.max(8, x);
        y = Math.min(window.innerHeight - tooltipRect.height - 8, Math.max(8, y));
    }

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
    <div bind:this={tooltipEl} class="tooltip" style="top:{y}px; left:{x}px;">

        {#if type === "enhancement"}
            <b class="bonus">Double</b> {upgrade.name} efficiency <br>

            {#if upgrade.type === "cursor"}
                <span class="bonus">+{upgrade.crit.bonus * 100}%</span> crit chance <br>
            {/if}

            <Cost value={cost} />

        {:else if type === "bonus"}

            <span class="bonus">+{upgrade.increase * 100}%</span> {upgrade.description} <br>
            <span class="total">{$game[upgrade.id] * 100}%</span> total <br>
            <Cost value={cost} />

        {:else if type === "upgrade"}

            <div class="upgrade-tooltip">
                <div class="head">
                    <span class="name">{upgrade.name}</span>
                    <Cost value={cost} />
                </div>
                <span class="description">{upgrade.description}</span>
                {#if upgrade.stock > 0}
                    <span>
                        each {upgrade.name} produces <b class="bonus">{displayNumber(game.getProduction(upgrade, true), false, true)}</b> per second
                    </span>
                    <span>
                        {upgrade.stock} {upgrade.name}s produces a total of <b class="bonus">{displayNumber(game.getProduction(upgrade), false, true)}</b> per second
                    </span>
                    {#if upgrade.type === "cursor"}
                        <span>
                            gives <b class="bonus">+{displayNumber($game.crit.chance * 100)}%</b> <small>Crit chance</small>
                            (<b class="bonus">x{displayNumber($game.crit.multiplier, true)}</b> <small> Crit multiplier</small>)
                        </span>
                    {/if}
                {:else}
                    <span>???</span>
                {/if}
            </div>

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
        font-size: 10px;
        white-space: nowrap;
        z-index: 1000;
    }

    .upgrade-tooltip {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .head {
        display: flex;
        justify-content: space-between;
    }

    .name {
        font-size: 15px;
    }

    .description {
        font-size: 8px;
        opacity: 0.5;
        margin-bottom: 10px;
        border-bottom: 1px solid #fff;
    }

    .total {
        color: blueviolet;
    }
</style>
