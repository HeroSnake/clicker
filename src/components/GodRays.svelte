<script>
    import { onMount, onDestroy } from "svelte";

    export let size = 600;       // Canvas size (pixels)
    export let color = "255,255,230";

    let raysCanvas;
    let ctx;
    let raf;

    const CENTER = () => size / 2;

    // Ray layers: inner/outer will scale with size
    const layers = [
        { rays: 6, inner: 0.05, outer: 0.25, speed: 0.0015, opacity: 0.25, rotation: 0 },
        { rays: 10, inner: 0.04, outer: 0.22, speed: -0.0022, opacity: 0.18, rotation: 0 },
        { rays: 14, inner: 0.03, outer: 0.20, speed: 0.003, opacity: 0.12, rotation: 0 }
    ];

    function drawLayer(layer) {
        ctx.save();
        ctx.translate(CENTER(), CENTER());
        ctx.rotate(layer.rotation);

        const inner = layer.inner * size;
        const outer = layer.outer * size;

        for (let i = 0; i < layer.rays; i++) {
            const angle = (i / layer.rays) * Math.PI * 2;
            const width = Math.PI / layer.rays * 0.6;

            ctx.beginPath();
            ctx.moveTo(Math.cos(angle - width) * inner, Math.sin(angle - width) * inner);
            ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            ctx.lineTo(Math.cos(angle + width) * inner, Math.sin(angle + width) * inner);
            ctx.closePath();

            const gradient = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
            gradient.addColorStop(0, `rgba(${color},${layer.opacity})`);
            gradient.addColorStop(1, `rgba(${color},0)`);

            ctx.fillStyle = gradient;
            ctx.fill();
        }

        ctx.restore();
        layer.rotation += layer.speed;
    }

    function draw() {
        ctx.clearRect(0, 0, size, size);
        layers.forEach(drawLayer);
        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        raysCanvas.width = size;
        raysCanvas.height = size;
        ctx = raysCanvas.getContext("2d");
        draw();
    });

    onDestroy(() => cancelAnimationFrame(raf));
</script>

<canvas bind:this={raysCanvas} id="godrays"></canvas>

<style>
    #godrays {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 2;
    }
</style>
