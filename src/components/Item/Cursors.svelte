<script>
    import { onMount } from "svelte";
    import { game } from "../../store/game";
    import { displayMode } from "../../store/display";

    let canvas;
    let ctx;
    let cursorImg;

    const SIZE = 20;
    const RING_SPACING = 20;
    const CURSOR_DURATION = 500;
    const PULSE_AMPLITUDE = 8;
    const ROTATION_SPEED = 0.00015;

    $: totalCursors = Math.max(0, $game.upgrades.find(u => u.id === 0)?.stock || 0);

    let lastTotal = 0;
    let ringSpeeds = [];
    let ringCount = 0;

    $: innerRadius = $displayMode === "desktop" ? document.getElementById("item-button")?.clientWidth * 0.7 : 100;

    const startTime = performance.now();

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    onMount(async () => {
        ctx = canvas.getContext("2d");

        cursorImg = new Image();
        cursorImg.src = "/img/cursor/cursor-small.png";
        await cursorImg.decode();

        resize();
        window.addEventListener("resize", resize);

        updateRings();
        requestAnimationFrame(draw);
    });

    function resize() {
        if(!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    $: if (totalCursors !== lastTotal) {
        lastTotal = totalCursors;
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
                ringSpeeds[ring] =
                    (Math.random() * 0.5 + 0.5) * ROTATION_SPEED;
            }

            remaining -= count;
            ring++;
        }

        ringCount = ring;
    }

    function draw(now) {
        if(!canvas) return;

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
            const pairIndex =
                half > 0
                    ? Math.floor(elapsed / CURSOR_DURATION) % half
                    : -1;

            for (let i = 0; i < count; i++) {
                let pulse = 0;

                if (
                    half > 0 &&
                    (i === pairIndex ||
                        i === (pairIndex + half) % count)
                ) {
                    const t = (elapsed % CURSOR_DURATION) / CURSOR_DURATION;
                    pulse =
                        easeOutCubic(
                            t <= 0.5 ? t * 2 : (1 - t) * 2
                        ) * PULSE_AMPLITUDE;
                }

                const angle = startAngle + i * step + rotation;
                const animatedRadius = radius - pulse;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -animatedRadius);
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

        requestAnimationFrame(draw);
    }
</script>

<canvas bind:this={canvas} id="cursors"></canvas>

<style>
    #cursors {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 2;
    }
</style>
