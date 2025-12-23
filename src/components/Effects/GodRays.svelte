<script>
    import { onMount, onDestroy } from "svelte";
    import { display } from "../../store/display";

    const dpr = window.devicePixelRatio || 1;
    const TARGET_FPS = $display.device === "mobile" ? 30 : 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    let canvas;
    let ctx;
    let raf;
    let lastTime = 0;
    let layers = [];

    $effect(() => {
        layers = $display.device === "mobile"
        ? [
            { rays: 8, inner: 0.08, outer: 0.35, speed: 0.0008, opacity: 0.25, rotation: 0 }
        ]
        : [
            { rays: 8,  inner: 0.06, outer: 0.38, speed:  0.0013, opacity: 0.28, rotation: 0 },
            { rays: 12, inner: 0.05, outer: 0.34, speed: -0.0020, opacity: 0.20, rotation: 0 },
            { rays: 18, inner: 0.04, outer: 0.30, speed:  0.0028, opacity: 0.14, rotation: 0 }
        ];
    })

    const layerCanvases = [];

    function renderSize() {
        return Math.min(canvas.clientWidth, canvas.clientHeight) * dpr;
    }

    function resizeCanvas() {
        if (!canvas) return;

        const size = renderSize();

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;

        layerCanvases.length = 0;
        layers.forEach(l => layerCanvases.push(prerenderLayer(l, size)));
    }

    function prerenderLayer(layer, deviceSize) {
        const half = deviceSize / 2;

        const c = document.createElement("canvas");
        c.width = deviceSize;
        c.height = deviceSize;

        const cctx = c.getContext("2d");

        // Everything in device pixels, no extra DPR transform
        cctx.translate(half, half);

        const inner = layer.inner * deviceSize;
        const outer = layer.outer * deviceSize;

        const gradient = cctx.createRadialGradient(0, 0, inner, 0, 0, outer);
        gradient.addColorStop(0, `rgba(255,255,230,${layer.opacity})`);
        gradient.addColorStop(1, `rgba(255,255,230,0)`);
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

    function draw(time) {
        if (time - lastTime < FRAME_TIME) {
            raf = requestAnimationFrame(draw);
            return;
        }
        lastTime = time;

        const deviceWidth = canvas.clientWidth * dpr;
        const deviceHeight = canvas.clientHeight * dpr;
        const half = deviceWidth < deviceHeight ? deviceWidth / 2 : deviceHeight / 2;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, deviceWidth, deviceHeight);

        layers.forEach((layer, i) => {
            ctx.save();
            ctx.translate(deviceWidth / 2, deviceHeight / 2); // canvas center
            ctx.rotate(layer.rotation);
            ctx.drawImage(layerCanvases[i], -half, -half);
            ctx.restore();

            layer.rotation += layer.speed;
        });

        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");
        resizeCanvas();
        raf = requestAnimationFrame(draw);

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);

        onDestroy(() => {
            cancelAnimationFrame(raf);
            resizeObserver.disconnect();
        });
    });
</script>

<canvas bind:this={canvas} class="godrays"></canvas>

<style>
    .godrays {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        pointer-events:none;
        z-index: -1;
    }
</style>
