<script>
    import { onMount } from "svelte";
    import { game } from "../../store/game";

    let canvas;
    let ctx;
    let cursorImg;

    const SIZE = 20;
    const RING_SPACING = 20;
    const CURSOR_DURATION = 500;
    const PULSE_AMPLITUDE = 8;
    const ROTATION_SPEED = 0.00015;

    $: totalCursors = Math.max(0, $game.upgrades.find(u => u.id === 0)?.stock || 0);

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    onMount(async () => {
        ctx = canvas.getContext("2d");

        cursorImg = new Image();
        cursorImg.src = "./img/cursor/cursor-small.png";
        await cursorImg.decode();

        resize();
        window.addEventListener("resize", resize);

        initRings();

        requestAnimationFrame(draw);
    });

    function resize() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let startTime = performance.now();
    let ringSpeeds = [];

    function initRings() {
        ringSpeeds = [];

        let remainingCursors = totalCursors;
        let ring = 0;
        const innerRadius = document.getElementById('item-button')?.clientWidth * 0.7 || 100;

        while (remainingCursors > 0) {
            const radius = innerRadius + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE);
            const cursorsOnRing = Math.min(remainingCursors, maxOnRing);

            ringSpeeds.push((Math.random() * 0.5 + 0.5) * ROTATION_SPEED);

            remainingCursors -= cursorsOnRing;
            ring++;
        }
    }

    function draw(now = performance.now()) {
        if (!canvas) return;

        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        let remainingCursors = totalCursors;
        let ring = 0;
        const innerRadius = document.getElementById('item-button')?.clientWidth * 0.7 || 100;

        let ringCursorStartIndex = 0;

        while (remainingCursors > 0) {
            const radius = innerRadius + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE);
            const cursorsOnRing = Math.min(remainingCursors, maxOnRing);

            let startAngle, step;
            if (cursorsOnRing < maxOnRing) {
                const totalArc = (cursorsOnRing * SIZE) / radius;
                startAngle = -totalArc / 2;
                step = totalArc / cursorsOnRing;
            } else {
                startAngle = 0;
                step = (2 * Math.PI) / cursorsOnRing;
            }

            for (let i = 0; i < cursorsOnRing; i++) {
                const rotation = now * ringSpeeds[ring];
                const angle = startAngle + i * step + rotation;

                const elapsed = now - startTime;
                const half = Math.floor(cursorsOnRing / 2);
                const pairIndex = Math.floor(elapsed / CURSOR_DURATION) % half;

                const isActivePair =
                    i === pairIndex ||
                    i === (pairIndex + half) % cursorsOnRing;

                let pulse = 0;
                if (isActivePair) {
                    const t = (elapsed % CURSOR_DURATION) / CURSOR_DURATION;
                    pulse =
                        easeOutCubic(t <= 0.5 ? t * 2 : (1 - t) * 2) *
                        PULSE_AMPLITUDE;
                }

                const animatedRadius = radius - pulse;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -animatedRadius);
                ctx.rotate(Math.PI);
                ctx.drawImage(cursorImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
                ctx.restore();
            }


            remainingCursors -= cursorsOnRing;
            ring++;
            ringCursorStartIndex += cursorsOnRing;
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
        width: auto;
        height: 110vh;
        pointer-events: none;
        z-index: 2;
    }
</style>
