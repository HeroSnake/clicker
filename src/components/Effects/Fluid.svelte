<script>
    import { onMount, onDestroy } from "svelte";
    import { achievements } from "../../store/achievements";

    const STEP = 3;
    const HEIGHT_LERP = 0.08;
    const waves = [
        { amp: 10, len: 600, speed: 0.02, freq: 0 },
        { amp: 6,  len: 300, speed: 0.015, freq: 0 },
        { amp: 4,  len: 150, speed: 0.01, freq: 0 }
    ];
    const offsetsFront = waves.map(() => 0);
    const offsetsBack  = waves.map(() => 0);
    const dpr = window.devicePixelRatio || 1;

    let canvas;
    let ctx;
    let animationFrame;
    let gradientFront;
    let gradientBack;
    let targetFluidHeight = 0;
    let animatedFluidHeight = 0;

    let topEdgeY = [];
    let resizeObserver = new ResizeObserver(resizeCanvas);

    $effect(() => {
        targetFluidHeight = 600 * ($achievements.unlocked.size / $achievements.list.length);
    });

    function resizeCanvas() {
        if (!canvas) return;

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        topEdgeY.length = Math.ceil(canvas.clientWidth / STEP) + 1;
    }

    function rebuildGradients(height) {
        const baseYFront = height - animatedFluidHeight + 30;
        const baseYBack  = height - animatedFluidHeight;

        gradientBack = ctx.createLinearGradient(0, baseYBack - 20, 0, height);
        gradientBack.addColorStop(0, "rgba(230,230,200,0.8)");
        gradientBack.addColorStop(0.4, "rgba(240,240,210,0.7)");
        gradientBack.addColorStop(1, "rgba(220,220,180,0.6)");

        gradientFront = ctx.createLinearGradient(0, baseYFront - 30, 0, height);
        gradientFront.addColorStop(0, "rgba(255,255,240,1)");
        gradientFront.addColorStop(0.2, "rgba(255,255,240,0.8)");
        gradientFront.addColorStop(0.4, "rgba(255,250,230,0.7)");
        gradientFront.addColorStop(0.7, "rgba(255,245,220,0.6)");
        gradientFront.addColorStop(1, "rgba(255,240,210,0.5)");
    }

    function drawWave(baseY, offsets, width, height, storeTopEdge = false) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        let index = 0;
        for (let x = 0; x <= width; x += STEP) {
            let y = baseY;
            for (let i = 0; i < waves.length; i++) {
                y += Math.sin(x * waves[i].freq + offsets[i]) * waves[i].amp;
            }
            ctx.lineTo(x, y);
            if (storeTopEdge) topEdgeY[index++] = y;
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
    }

    function drawFluid() {
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        ctx.clearRect(0, 0, width, height);

        animatedFluidHeight +=
            (targetFluidHeight - animatedFluidHeight) * HEIGHT_LERP;

        rebuildGradients(height);

        const baseYFront = height - animatedFluidHeight + 30;
        const baseYBack  = height - animatedFluidHeight;

        // Back layer
        ctx.fillStyle = gradientBack;
        drawWave(baseYBack, offsetsBack, width, height);

        // Front layer
        ctx.fillStyle = gradientFront;
        drawWave(baseYFront, offsetsFront, width, height, true);

        // Glow on surface
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 12;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "white";
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        for (let i = 0, x = 0; x <= width; x += STEP, i++) {
            if (i === 0) ctx.moveTo(x, topEdgeY[i]);
            else ctx.lineTo(x, topEdgeY[i]);
        }
        ctx.stroke();
        ctx.restore();

        // Animate waves
        for (let i = 0; i < waves.length; i++) {
            offsetsFront[i] += waves[i].speed;
            offsetsBack[i]  += waves[i].speed;
        }

        animationFrame = requestAnimationFrame(drawFluid);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");

        waves.forEach(w => {
            w.freq = (2 * Math.PI) / w.len;
        });

        resizeCanvas();
        animatedFluidHeight = targetFluidHeight;
        drawFluid();

        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
    });
</script>

<canvas bind:this={canvas} id="fluid"></canvas>

<style>
    #fluid {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
        z-index: 1;
    }
</style>
