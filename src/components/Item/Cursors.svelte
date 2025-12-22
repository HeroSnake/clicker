<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";
    import { displayMode } from "../../store/display";

    let canvas;
    let ctx;
    let cursorImg;
    let innerRadius;

    const SIZE = 20;
    const RING_SPACING = 20;
    const CURSOR_DURATION = 500;
    const PULSE_AMPLITUDE = 8;
    const ROTATION_SPEED = 0.00015;

    const isMobile = window.innerWidth < 768;
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    $: totalCursors = Math.max(0, $game.buildings.find(b => b.id === 0)?.stock || 0);

    let lastTotal = 0;
    let ringSpeeds = [];
    let ringCount = 0;
    let startTime = 0;
    let lastFrame = performance.now();
    let raf;

    $: if (totalCursors !== lastTotal) {
        lastTotal = totalCursors;
        updateRings();
    }

    function easeOutCubic(t) {
        const f = 1 - t;
        return 1 - f * f * f;
    }

    function updateInnerRadius() {
        const itemButton = document.getElementById("item-button");
        innerRadius = $displayMode === "desktop" && itemButton ? itemButton.clientWidth * 0.7 : 200;
    }

    function resize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        let remaining = totalCursors;
        let ring = 0;

        const elapsed = now - startTime;

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
            const half = Math.floor(count / 2);
            const pairIndex = half > 0 ? Math.floor(elapsed / CURSOR_DURATION) % half : -1;

            for (let i = 0; i < count; i++) {
                let pulse = 0;
                if (half > 0 && (i === pairIndex || i === (pairIndex + half) % count)) {
                    const t = (elapsed % CURSOR_DURATION) / CURSOR_DURATION;
                    pulse = easeOutCubic(t <= 0.5 ? t * 2 : (1 - t) * 2) * PULSE_AMPLITUDE;
                }

                const angle = startAngle + i * step + rotation;
                const animatedRadius = radius - pulse;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -animatedRadius);
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
            resize();
            updateInnerRadius();
            updateRings();
            raf = requestAnimationFrame(draw);
        });

        window.addEventListener("resize", () => {
            resize();
            updateInnerRadius();
            updateRings();
        });
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
    });
</script>

<canvas bind:this={canvas} id="cursors"></canvas>

<style>
    #cursors {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 0;
    }
</style>
