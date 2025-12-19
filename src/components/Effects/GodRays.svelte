<script>
    import { onMount, onDestroy } from "svelte";

    export let color = "255,255,230";
    export let size = window.innerWidth * 1.1;

    let raysCanvas;
    let ctx;
    let raf;

    const dpr = window.devicePixelRatio || 1;

    const layers = [
        { rays: 8,  inner: 0.06, outer: 0.38, speed:  0.0013, opacity: 0.28, rotation: 0 },
        { rays: 12, inner: 0.05, outer: 0.34, speed: -0.0020, opacity: 0.20, rotation: 0 },
        { rays: 18, inner: 0.04, outer: 0.30, speed:  0.0028, opacity: 0.14, rotation: 0 }
    ];

    function computeSize() {
        raysCanvas.width  = size * dpr;
        raysCanvas.height = size * dpr;
        raysCanvas.style.width  = `${size}px`;
        raysCanvas.style.height = `${size}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawLayer(layer) {
        ctx.save();
        ctx.translate(size / 2, size / 2);
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

    function handleResize() {
        computeSize();
    }

    onMount(() => {
        ctx = raysCanvas.getContext("2d");
        computeSize();
        window.addEventListener("resize", handleResize);
        draw();
    });

    onDestroy(() => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(raf);
    });
</script>

<canvas bind:this={raysCanvas} class="godrays"></canvas>

<style>
    .godrays {
        position: fixed;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -1;
        will-change: transform;
    }
</style>
