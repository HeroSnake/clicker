<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";
    import { display } from "../../store/display";

    const SIZE = 20;
    const RING_SPACING = 20;
    const ROT_SPEED = 0.0002;

    let canvas;
    let ctx;
    let cursorImg;
    let innerRadius;
    let resizeObserver;
    let raf;

    let rotation = 0;
    let ringCount = 0;

    const dpr = window.devicePixelRatio || 1;

    let totalCursors = $derived(
        Math.max(0, $game.buildings.find(b => b.id === 0)?.stock || 0)
    );

    let lastTotal = 0;

    $effect(() => {
        if (totalCursors !== lastTotal) {
            lastTotal = totalCursors;
            updateRings();
            drawStatic();
        }
    });

    function resizeCanvas() {
        if (!canvas || !ctx) return;

        const cssW = canvas.clientWidth;
        const cssH = canvas.clientHeight;

        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const itemButton = document.getElementById("item-button");
        innerRadius = $display.device === "mobile"
            ? 100
            : (itemButton?.clientWidth || 200) * 0.7;

        updateRings();
        drawStatic();
    }

    function updateRings() {
        let remaining = totalCursors;
        let ring = 0;

        while (remaining > 0) {
            const radius = innerRadius + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE);
            const count = Math.min(remaining, maxOnRing);

            remaining -= count;
            ring++;
        }

        ringCount = ring;
    }

    function drawFrame() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        if ($display.device !== "mobile") {
            rotation += ROT_SPEED;
        }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        ctx.translate(-cx, -cy);

        let remaining = totalCursors;
        let ring = 0;

        while (remaining > 0) {
            const radius = innerRadius + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE);
            const count = Math.min(remaining, maxOnRing);

            let startAngle, step;

            if (count < maxOnRing) {
                const arc = (count * SIZE) / radius;
                startAngle = -arc / 2;
                step = arc / count;
            } else {
                startAngle = 0;
                step = (2 * Math.PI) / count;
            }

            for (let i = 0; i < count; i++) {
                const angle = startAngle + i * step;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -radius);
                ctx.rotate(Math.PI);
                ctx.drawImage(
                    cursorImg,
                    -SIZE / 2,
                    -SIZE / 2,
                    SIZE,
                    SIZE
                );
                ctx.restore();
            }

            remaining -= count;
            ring++;
        }

        ctx.restore();
    }

    function draw() {
        drawFrame();
        raf = requestAnimationFrame(draw);
    }

    function drawStatic() {
        if (!ctx) return;
        drawFrame();
    }

    onMount(() => {
        ctx = canvas.getContext("2d", { alpha: true });

        cursorImg = new Image();
        cursorImg.src = "./img/cursor/cursor-small.png";

        cursorImg.decode().then(() => {
            resizeCanvas();

            if ($display.device !== "mobile") {
                raf = requestAnimationFrame(draw);
            }
        });

        resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver?.disconnect();
    });
</script>

<canvas bind:this={canvas} id="cursors"></canvas>

<style>
    #cursors {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    }
</style>
