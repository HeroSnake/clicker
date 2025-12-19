<script>
    import { fly } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import { displayMode } from "./../../store/display";
    import Augments from "./Augments.svelte";
    import Upgrades from "./Upgrades.svelte";

    let shopEl;

    let collapsed = false;
    let multiples = [1, 10, 100];
    let multiple = 1;

    // swipe state (mobile only)
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const SWIPE_THRESHOLD = 80;

    /* ---------------- KEYBOARD (desktop) ---------------- */

    function handleKeyDown(event) {
        if (event.key === "Shift") multiple = multiples[2];
        if (event.key === "Control") multiple = multiples[1];

        if (event.key === "Tab") {
            event.preventDefault();
            collapsed = !collapsed;
        }
    }

    function handleKeyUp(event) {
        if (event.key === "Shift" || event.key === "Control") {
            multiple = multiples[0];
        }
    }

    /* ---------------- SWIPE (mobile) ---------------- */

    function onPointerDown(e) {
        if ($displayMode !== "phone") return;

        dragging = true;
        startX = e.clientX;
        currentX = startX;

        shopEl.style.transition = "none";
    }

    function onPointerMove(e) {
        if (!dragging || $displayMode !== "phone") return;

        currentX = e.clientX;
        let delta = currentX - startX;

        if (collapsed) {
            // opening (drag left)
            delta = Math.min(0, Math.max(delta, -window.innerWidth));
            shopEl.style.transform = `translateX(${delta + window.innerWidth}px)`;
        } else {
            // closing (drag right)
            delta = Math.max(0, Math.min(delta, window.innerWidth));
            shopEl.style.transform = `translateX(${delta}px)`;
        }
    }

    function onPointerUp() {
        if (!dragging || $displayMode !== "phone") return;
        dragging = false;

        shopEl.style.transition = "transform 0.25s ease";
        const delta = currentX - startX;

        if (collapsed && delta < -SWIPE_THRESHOLD) {
            collapsed = false;
        } else if (!collapsed && delta > SWIPE_THRESHOLD) {
            collapsed = true;
        }

        applyTransform();
    }

    function applyTransform() {
        if ($displayMode !== "phone") return;

        shopEl.style.transform = collapsed
            ? `translateX(100%)`
            : `translateX(0)`;
    }

    /* ---------------- LIFECYCLE ---------------- */

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // default state
        if ($displayMode === "phone") {
            collapsed = true;
            requestAnimationFrame(applyTransform);
        }
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    });
</script>

{#if $displayMode === "desktop" && !collapsed}
    <!-- DESKTOP (unchanged) -->
    <div id="shop" transition:fly={{ x: 150, duration: 150 }}>
        <div class="header">
            <span class="title">SHOP</span>
            {#each multiples as m}
                <button
                    class="{m === multiple ? 'selected' : ''}"
                    on:click={() => multiple = m}
                >
                    {m}
                </button>
            {/each}
        </div>

        <Augments />
        <Upgrades {multiple} />
    </div>
{/if}

{#if $displayMode === "phone"}
    <!-- MOBILE (swipeable) -->
    <div
        id="shop"
        bind:this={shopEl}
        on:pointerdown={onPointerDown}
        on:pointermove={onPointerMove}
        on:pointerup={onPointerUp}
        on:pointercancel={onPointerUp}
    >
        <div class="header">
            <span class="title">SHOP</span>
            {#each multiples as m}
                <button
                    class="{m === multiple ? 'selected' : ''}"
                    on:click={() => multiple = m}
                >
                    {m}
                </button>
            {/each}
        </div>

        <Augments />
        <Upgrades {multiple} />
    </div>
{/if}

<style>
    #shop {
        background-color: #2e2e2ecc;
        width: 500px;
        height: 100vh;
        overflow-x: hidden;
        overflow-y: auto;
        z-index: 10;
        position: relative;
        will-change: transform;
    }

    .selected {
        box-shadow: 0 0 8px 3px #fff, 0 0 14px 3px #ffe56666;
        background: #353430;
        border-radius: 6px;
        border: 1.5px solid #fff;
        transition: box-shadow 0.15s, background 0.15s;
    }

    .header {
        display: flex;
        flex-direction: row;
        padding: 10px;
        gap: 10px;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 2;
        background-color: #2e2e2ed1;
    }

    .title {
        font-weight: bold;
    }

    /* MOBILE */
    @media (max-width: 768px) {
        #shop {
            position: fixed;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            transform: translateX(100%);
            transition: transform 0.25s ease;
            touch-action: pan-y;
        }

        .header {
            flex-wrap: wrap;
            gap: 7px;
            padding: 8px;
        }

        .title {
            font-size: 16px;
        }
    }
</style>
