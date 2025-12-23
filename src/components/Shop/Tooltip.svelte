<script>
    import { onMount, tick } from "svelte";
    import { fly } from 'svelte/transition';
    import { displayNumber } from "../../utils";
    import { game } from "../../store/game";
    import Cost from "./Cost.svelte";
    import BuildingImg from "./BuildingImg.svelte";
    import { displayMode } from "../../store/display";

    const props = $props();

    let visible = $state(false);
    let tooltipEl = $state(null);
    let targetEl;

    let x = $state(0);
    let y = $state(0);

    async function handleMouseEnter(event) {
        visible = true;
        targetEl = event.currentTarget;
        await tick();

        if ($displayMode === "desktop") {
            setPosition();
        }
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
        x = shopRect.left - tooltipRect.width - 8;

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

<button class="no-btn" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
    {@render props.children()}
</button>

{#if visible}
    <div bind:this={tooltipEl} class="tooltip cracked-border" style="top:{y}px; left:{x}px;" transition:fly={{ x: 150, duration: 150 }}>
        <div class="head">
            <BuildingImg img={props.data.img} />
            <div>
                <div class="info">
                    <span class="name">{props.data.name}</span>
                    <Cost value={props.data.cost} />
                </div>
                <span class="description">{props.data.description}</span>
            </div>
        </div>
        <div class="body">
            {#if props.data.libelle === "upgrade"}

                <span>
                    <b class="bonus">Double</b> {props.data.name} efficiency
                </span>

                {#if props.data.type === "cursor"}
                    <span>
                        <span class="bonus">+{displayNumber(props.data.crit.bonus * 100)}%</span> crit chance
                    </span>
                {/if}

            {:else if props.data.libelle === "bonus"}
                    <span>
                        <span class="bonus">+{displayNumber(props.data.increase * 100)}%</span> {props.data.detail}
                    </span>
                    <span>
                        <span class="total">{displayNumber($game[props.data.code] * 100)}%</span> total
                    </span>

            {:else if props.data.libelle === "building"}
                {#if props.data.stock > 0}
                    <span>
                        Each {props.data.name} produces <b class="bonus">{displayNumber(game.getBuildingProduction(props.data, true), false, true)}</b> per second
                    </span>
                    <span>
                        {props.data.stock} {props.data.name}s produces a total of <b class="bonus">{displayNumber(game.getBuildingProduction(props.data), false, true)}</b> per second
                    </span>
                    {#if props.data.type === "cursor"}
                        <span>
                            <b class="total">+{displayNumber($game.crit.chance * 100)}%</b> <small>Crit chance</small>
                            (<b class="total">x{displayNumber($game.crit.multiplier, true)}</b> <small> Crit multiplier</small>)
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
        font-size: 1.2rem;
        white-space: normal;
        z-index: 2;
        width: 500px;
        line-height: 1.2rem;
        background: url('/img/textures/wood-horizontal-dark.png');
        background-size: cover;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
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
            width: calc(100% - 40px);
            bottom: 0;
            top: auto !important;
        }
    }
</style>
