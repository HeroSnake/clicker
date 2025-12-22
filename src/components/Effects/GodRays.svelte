<script>
    import { onMount, onDestroy } from "svelte";

    export let color = "255,255,230";
    export let size = Math.min(window.innerWidth * 1.1, 600);

    let canvas;
    let ctx;
    let raf;
    let resizeTimeout;

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : (window.devicePixelRatio || 1);

    // Fewer layers & rays on mobile
    const layers = isMobile
        ? [
            { rays: 8,  inner: 0.08, outer: 0.35, speed:  0.0008, opacity: 0.25, rotation: 0 }
          ]
        : [
            { rays: 8,  inner: 0.06, outer: 0.38, speed:  0.0013, opacity: 0.28, rotation: 0 },
            { rays: 12, inner: 0.05, outer: 0.34, speed: -0.0020, opacity: 0.20, rotation: 0 },
            { rays: 18, inner: 0.04, outer: 0.30, speed:  0.0028, opacity: 0.14, rotation: 0 }
          ];

    const layerCanvases = [];

    function setupCanvas() {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function prerenderLayer(layer) {
        const c = document.createElement("canvas");
        c.width = size * dpr;
        c.height = size * dpr;
        const cctx = c.getContext("2d");
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cctx.translate(size / 2, size / 2);

        const inner = layer.inner * size;
        const outer = layer.outer * size;

        const gradient = cctx.createRadialGradient(0, 0, inner, 0, 0, outer);
        gradient.addColorStop(0, `rgba(${color},${layer.opacity})`);
        gradient.addColorStop(1, `rgba(${color},0)`);

        cctx.fillStyle = gradient;

        for (let i = 0; i < layer.rays; i++) {
            const angle = (i / layer.rays) * Math.PI * 2;
            const width = Math.PI / layer.rays * 0.6;

            cctx.beginPath();
            cctx.moveTo(Math.cos(angle - width) * inner, Math.sin(angle - width) * inner);
            cctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
            cctx.lineTo(Math.cos(angle + width) * inner, Math.sin(angle + width) * inner);
            cctx.closePath();
            cctx.fill();
        }

        return c;
    }

    let lastTime = 0;
    const FRAME_TIME = isMobile ? 1000 / 30 : 1000 / 60;

    function draw(time) {
        if (time - lastTime < FRAME_TIME) {
            raf = requestAnimationFrame(draw);
            return;
        }
        lastTime = time;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // reset transform first
        ctx.clearRect(0, 0, size, size);
        ctx.translate(size / 2, size / 2);

        layers.forEach((layer, i) => {
            ctx.save();
            ctx.rotate(layer.rotation);
            ctx.drawImage(layerCanvases[i], -size / 2, -size / 2);
            ctx.restore();
            layer.rotation += layer.speed;
        });

        raf = requestAnimationFrame(draw);
    }

    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            size = Math.min(window.innerWidth * 1.1, 600);
            setupCanvas();
            layerCanvases.length = 0;
            layers.forEach(l => layerCanvases.push(prerenderLayer(l)));
        }, 100);
    }

    onMount(() => {
        ctx = canvas.getContext("2d", { alpha: true });
        setupCanvas();

        layerCanvases.length = 0;
        layers.forEach(l => layerCanvases.push(prerenderLayer(l)));

        window.addEventListener("resize", handleResize);
        raf = requestAnimationFrame(draw);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", handleResize);
    });
</script>

<canvas bind:this={canvas} class="godrays"></canvas>

<style>
    .godrays {
        position: fixed;
        inset: 50% auto auto 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -1;
        opacity: 0.9;
    }
</style>
