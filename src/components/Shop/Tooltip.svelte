<script>
    import { onMount, tick } from "svelte";
    import { fly } from 'svelte/transition';
    import { displayNumber } from "../../utils";
    import { game } from "../../store/game";
    import Cost from "./Cost.svelte";
    import UpgradeLogo from "./UpgradeLogo.svelte";

    export let type = '';
    export let upgrade = {};
    export let img = '';
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
    <div bind:this={tooltipEl} class="tooltip cracked-border" style="top:{y}px; left:{x}px;" transition:fly={{ x: 150, duration: 150 }}>
        <div class="head">
            <UpgradeLogo {img} />
            <div>
                <div class="info">
                    <span class="name">{upgrade.name}</span>
                    <Cost value={cost} />
                </div>
                <span class="description">{upgrade.description}</span>
            </div>
        </div>
        <div class="body">
            {#if type === "enhancement"}

                <span>
                    <b class="bonus">Double</b> {upgrade.name} efficiency
                </span>

                {#if upgrade.type === "cursor"}
                    <span>
                        <span class="bonus">+{upgrade.crit.bonus * 100}%</span> crit chance
                    </span>
                {/if}

            {:else if type === "bonus"}
                    <span>
                        <span class="bonus">+{upgrade.increase * 100}%</span> {upgrade.detail}
                    </span>
                    <span>
                        <span class="total">{$game[upgrade.code] * 100}%</span> total
                    </span>

            {:else if type === "upgrade"}
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
            {/if}
        </div>
    </div>
{/if}

<style>
    .tooltip {
        position: fixed;
        pointer-events: none;
        background: #000000;
        color: #d1d1d1;
        padding: 10px;
        border-radius: 2px;
        font-size: 1rem;
        white-space: normal;
        z-index: 1000;
        width: 500px;
        line-height: 1.2rem;
    }
    .tooltip::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('./img/textures/wooden-logs.png');
        background-size: cover;
        filter: blur(1px) brightness(0.35);
        z-index: 0;
    }
    .tooltip > * {
        position: relative;
        z-index: 1;
    }
    .head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    .info {
        display: flex;
        align-items: flex-start;
    }

    .body {
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
    }

    .name {
        font-size: 2rem;
    }

    .description {
        font-size: 1.1rem;
    }

    @media (max-width: 768px) {
        .tooltip {
            width: 100%;
            bottom: 0;
            top: auto !important;
        }
    }
</style>
