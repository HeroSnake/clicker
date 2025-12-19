<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";

    let boostCanvas;
    let ctx;
    let width = 0;
    let height = 0;

    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        const plate = document.getElementById("plate");
        if (!plate || !boostCanvas) return;

        width = plate.offsetWidth;
        height = plate.offsetHeight;

        boostCanvas.width  = width * dpr;
        boostCanvas.height = height * dpr;
        boostCanvas.style.width  = width + "px";
        boostCanvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGlow() {
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const glowAlpha = 0.4 + 0.15 * Math.sin(performance.now() * 0.004);
        const maxBlur = 80; // bigger glow

        // Diffused glow with more intensity
        for (let i = 1; i <= 8; i++) {
            ctx.strokeStyle = `rgba(255,215,0,${glowAlpha / i})`;
            ctx.lineWidth = 4 + i * 6; // bigger strokes
            ctx.shadowColor = `rgba(255,215,0,${glowAlpha / i})`;
            ctx.shadowBlur = maxBlur / i;
            ctx.strokeRect(i, i, width - i * 2, height - i * 2);
        }
    }

    onMount(() => {
        ctx = boostCanvas.getContext("2d");
        resizeCanvas();
        drawGlow();
        window.addEventListener("resize", resizeCanvas);
    });

    onDestroy(() => {
        stop();
        window.removeEventListener("resize", resizeCanvas);
    });

</script>

<canvas bind:this={boostCanvas} class="boost-glow {$game.isProductionBoosted ? 'visible' : ''}"></canvas>

<style>
    .boost-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
        opacity: 0;
        transition: opacity 0.35s ease;
    }

    .boost-glow.visible {
        opacity: 1;
    }
</style>
