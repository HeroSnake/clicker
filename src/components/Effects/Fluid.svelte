<script>
    import { onMount } from "svelte";
    import { game } from "../../store/game";

    let canvas;
    let ctx;
    let animationFrame;

    let fluidHeight = 0;
    let width = 0;
    let height = 0;

    // Resolution of the wave (lower = faster, still smooth)
    const STEP = 3;

    const waves = [
        { amp: 10, len: 600, speed: 0.02, freq: 0 },
        { amp: 6,  len: 300, speed: 0.015, freq: 0 },
        { amp: 4,  len: 150, speed: 0.01, freq: 0 }
    ];

    const offsetsFront = waves.map(() => 0);
    const offsetsBack  = waves.map(() => 0);

    let topEdgeY = [];

    let gradientFront;
    let gradientBack;

    $: fluidHeight = $game.upgrades.reduce((a, u) => a + (u.stock || 0), 0);

    function rebuildGradients() {
        const baseYFront = height - fluidHeight + 30;
        const baseYBack  = height - fluidHeight;

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

    function drawWave(baseY, offsets, storeTopEdge = false) {
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
        ctx.clearRect(0, 0, width, height);

        const baseYFront = height - fluidHeight + 30;
        const baseYBack  = height - fluidHeight;

        // Back layer
        ctx.fillStyle = gradientBack;
        drawWave(baseYBack, offsetsBack);

        // Front layer
        ctx.fillStyle = gradientFront;
        drawWave(baseYFront, offsetsFront, true);

        // Glow
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

        // Animate
        for (let i = 0; i < waves.length; i++) {
            offsetsFront[i] += waves[i].speed;
            offsetsBack[i]  += waves[i].speed;
        }

        animationFrame = requestAnimationFrame(drawFluid);
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width  = window.innerWidth;
        height = window.innerHeight;

        canvas.width  = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        topEdgeY.length = Math.ceil(width / STEP) + 1;

        rebuildGradients();
    }

    onMount(() => {
        ctx = canvas.getContext("2d");

        waves.forEach(w => {
            w.freq = (2 * Math.PI) / w.len;
        });

        resize();
        window.addEventListener("resize", resize);

        drawFluid();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resize);
        };
    });
</script>

<canvas bind:this={canvas} id="fluid"></canvas>

<style>
    #fluid {
        position: absolute;
        bottom: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
    }
</style>
