<script>
    import { onMount, tick } from "svelte";
    import { fly } from 'svelte/transition';
    import { display } from "../../../store/display";
    import Body from "./Body.svelte";
    import Head from "./Head.svelte";

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

        if ($display.device === "desktop") {
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
        <Head data={props.data} />
        <div class="body">
            <Body data={props.data} />
        </div>
    </div>
{/if}

<style>
    .tooltip {
        position: fixed;
        pointer-events: none;
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

    .body {
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
    }

    @media (max-width: 768px) {
        .tooltip {
            width: calc(100% - 40px);
            bottom: 0;
            top: auto !important;
        }
    }
</style>
