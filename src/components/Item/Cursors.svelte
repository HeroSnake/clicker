<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";
    import { display } from "../../store/display";

    const SIZE = 20;
    const RING_SPACING = 20;
    const ROTATION_SPEED = 0.00015;
    const TARGET_FPS = $display.device === "mobile" ? 30 : 60;
    const FRAME_TIME = 1000 / TARGET_FPS;
    const dpr = window.devicePixelRatio || 1;

    let canvas;
    let ctx;
    let cursorImg;
    let innerRadius;
    let resizeObserver = new ResizeObserver(resizeCanvas);

    let ringSpeeds = [];
    let ringCount = 0;
    let startTime = 0;
    let lastFrame = performance.now();
    let raf;

    let totalCursors = $derived(Math.max(0, $game.buildings.find(b => b.id === 0)?.stock || 0));

    let lastTotal = 0;

    $effect(() => {
        if (totalCursors !== lastTotal) {
            lastTotal = totalCursors;
            updateRings();
        }
    });

    function resizeCanvas() {
        if (!canvas) return;

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const itemButton = document.getElementById("item-button");
        innerRadius = $display.device === "mobile" ? 100 : itemButton.clientWidth * 0.7;

        updateRings();
    }

    function updateRings() {
        let remaining = totalCursors;
        let ring = 0;

        while (remaining > 0) {
            const radius = innerRadius + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE);
            const count = Math.min(remaining, maxOnRing);

            if (ring >= ringCount) {
                ringSpeeds[ring] = (Math.random() * 0.5 + 0.5) * ROTATION_SPEED;
            }

            remaining -= count;
            ring++;
        }

        ringCount = ring;
    }

    function draw(now) {
        const dt = now - lastFrame;
        if (dt < FRAME_TIME) {
            raf = requestAnimationFrame(draw);
            return;
        }
        lastFrame = now;

        if (!canvas) return;

        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
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

            const rotation = now * (ringSpeeds[ring] ?? 0);

            for (let i = 0; i < count; i++) {
                const angle = startAngle + i * step + rotation;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -radius);
                ctx.rotate(Math.PI);
                ctx.drawImage(cursorImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
                ctx.restore();
            }

            remaining -= count;
            ring++;
        }

        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");

        cursorImg = new Image();
        cursorImg.src = "./img/cursor/cursor-small.png";
        cursorImg.decode().then(() => {
            startTime = performance.now();
            resizeCanvas();
            raf = requestAnimationFrame(draw);
        });

        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
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
