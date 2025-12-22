<script>
    import { onMount, onDestroy } from "svelte";

    export let color = "255,255,230";

    let canvas;
    let ctx;
    let raf;

    let width = 0;
    let height = 0;

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? 1 : (window.devicePixelRatio || 1);

    const layers = isMobile
        ? [
            { rays: 8, inner: 0.08, outer: 0.35, speed: 0.0008, opacity: 0.25, rotation: 0 }
        ]
        : [
            { rays: 8,  inner: 0.06, outer: 0.38, speed:  0.0013, opacity: 0.28, rotation: 0 },
            { rays: 12, inner: 0.05, outer: 0.34, speed: -0.0020, opacity: 0.20, rotation: 0 },
            { rays: 18, inner: 0.04, outer: 0.30, speed:  0.0028, opacity: 0.14, rotation: 0 }
        ];

    const layerCanvases = [];

    function renderSize() {
        return Math.min(width, height); // rays are circular, fit smallest dimension
    }

    function resizeCanvas() {
        const plate = document.getElementById("plate");
        if (!plate || !canvas) return;

        const rect = plate.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.style.left = rect.left + "px";
        canvas.style.top = rect.top + "px";

        ctx = canvas.getContext("2d");

        layerCanvases.length = 0;
        layers.forEach(l => layerCanvases.push(prerenderLayer(l)));
    }

    function prerenderLayer(layer) {
        const size = renderSize();
        const half = size / 2;

        const c = document.createElement("canvas");
        c.width = size * dpr;
        c.height = size * dpr;

        const cctx = c.getContext("2d");
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // **Translate to center of the layer canvas**
        cctx.translate(half, half);

        const inner = layer.inner * size;
        const outer = layer.outer * size;

        // Gradient centered at (0,0)
        const gradient = cctx.createRadialGradient(0, 0, inner, 0, 0, outer);
        gradient.addColorStop(0, `rgba(${color},${layer.opacity})`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        cctx.fillStyle = gradient;

        for (let i = 0; i < layer.rays; i++) {
            const angle = (i / layer.rays) * Math.PI * 2;
            const widthAngle = Math.PI / layer.rays * 0.6;

            const x0 = Math.cos(angle - widthAngle) * inner;
            const y0 = Math.sin(angle - widthAngle) * inner;
            const x1 = Math.cos(angle) * outer;
            const y1 = Math.sin(angle) * outer;
            const x2 = Math.cos(angle + widthAngle) * inner;
            const y2 = Math.sin(angle + widthAngle) * inner;

            cctx.beginPath();
            cctx.moveTo(x0, y0);
            cctx.lineTo(x1, y1);
            cctx.lineTo(x2, y2);
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

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const size = renderSize();
        const centerX = width / 2;
        const centerY = height / 2;

        layers.forEach((layer, i) => {
            ctx.save();
            ctx.translate(centerX, centerY); // center of the plate
            ctx.rotate(layer.rotation);
            ctx.drawImage(layerCanvases[i], -size, -size); // draw centered
            ctx.restore();

            layer.rotation += layer.speed;
        });

        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        raf = requestAnimationFrame(draw);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resizeCanvas);
    });
</script>

<canvas bind:this={canvas} class="godrays"></canvas>

<style>
    .godrays {
        position: fixed;
        pointer-events: none;
        z-index: -1;
    }
</style>
