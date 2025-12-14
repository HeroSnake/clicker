<script>
    import { onMount, onDestroy } from "svelte";

    let raysCanvas;
    let ctx;
    let raf;

    const SIZE = 220;
    const CENTER = SIZE / 2;

    // 3 ray layers = depth
    const layers = [
        {
            rays: 6,
            inner: 30,
            outer: 120,
            speed: 0.0015,
            opacity: 0.25,
            rotation: 0
        },
        {
            rays: 10,
            inner: 26,
            outer: 110,
            speed: -0.0022,
            opacity: 0.18,
            rotation: 0
        },
        {
            rays: 14,
            inner: 22,
            outer: 100,
            speed: 0.003,
            opacity: 0.12,
            rotation: 0
        }
    ];

    function drawLayer(layer) {
        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(layer.rotation);

        for (let i = 0; i < layer.rays; i++) {
            const angle = (i / layer.rays) * Math.PI * 2;
            const width = Math.PI / layer.rays * 0.6;

            ctx.beginPath();
            ctx.moveTo(
                Math.cos(angle - width) * layer.inner,
                Math.sin(angle - width) * layer.inner
            );
            ctx.lineTo(
                Math.cos(angle) * layer.outer,
                Math.sin(angle) * layer.outer
            );
            ctx.lineTo(
                Math.cos(angle + width) * layer.inner,
                Math.sin(angle + width) * layer.inner
            );
            ctx.closePath();

            const gradient = ctx.createRadialGradient(
                0,
                0,
                layer.inner,
                0,
                0,
                layer.outer
            );
            gradient.addColorStop(
                0,
                `rgba(255,255,230,${layer.opacity})`
            );
            gradient.addColorStop(1, "rgba(255,255,230,0)");

            ctx.fillStyle = gradient;
            ctx.fill();
        }

        ctx.restore();

        layer.rotation += layer.speed;
    }

    function draw() {
        ctx.clearRect(0, 0, SIZE, SIZE);

        // Draw back → front
        layers.forEach(drawLayer);

        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        raysCanvas.width = SIZE;
        raysCanvas.height = SIZE;
        ctx = raysCanvas.getContext("2d");

        draw();
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
    });
</script>

<canvas bind:this={raysCanvas} class="rays-canvas"></canvas>

<style>
.rays-canvas {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: auto;
    height: 110vh;
    pointer-events: none;
}
</style>
