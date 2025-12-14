<script>
    import { onMount } from "svelte";
    import { game } from "./store/game";

    let canvas;
    let ctx;
    let cursorImg;
    let rotation = 0;

    const INNER_RADIUS = 180; // empty center
    const SIZE = 20;          // cursor size and spacing
    const RING_SPACING = 20;  // distance between rings

    $: totalCursors = Math.max(0, $game.upgrades.find(u => u.id === 0)?.stock || 0);

    onMount(async () => {
        ctx = canvas.getContext("2d");

        cursorImg = new Image();
        cursorImg.src = "./img/upgrades/cursor-small.png";
        await cursorImg.decode();

        resize();
        window.addEventListener("resize", resize);
        requestAnimationFrame(draw);
    });

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
        if (!canvas) return;
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        let remainingCursors = totalCursors;
        let ring = 0;

        while (remainingCursors > 0) {
            const radius = INNER_RADIUS + ring * RING_SPACING;
            const circumference = 2 * Math.PI * radius;
            const maxOnRing = Math.floor(circumference / SIZE); // max cursors for no overlap
            const cursorsOnRing = Math.min(remainingCursors, maxOnRing);

            let startAngle, step;

            if (cursorsOnRing < maxOnRing) {
                // Partially filled → group cursors at top (centered)
                const totalArc = cursorsOnRing * SIZE / radius; // approximate total angle covered
                startAngle = -totalArc / 2; // center around top (angle = 0)
                step = totalArc / cursorsOnRing;
            } else {
                // Ring full → spread evenly around circle
                startAngle = 0;
                step = (2 * Math.PI) / cursorsOnRing;
            }

            for (let i = 0; i < cursorsOnRing; i++) {
                const angle = startAngle + i * step + rotation;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(angle);
                ctx.translate(0, -radius);
                ctx.rotate(Math.PI);
                ctx.drawImage(cursorImg, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
                ctx.restore();
            }

            remainingCursors -= cursorsOnRing;
            ring++;
        }

        rotation += 0.002;
        requestAnimationFrame(draw);
    }
</script>

<canvas bind:this={canvas} class="cursor-canvas"></canvas>

<style>
.cursor-canvas {
    position: absolute;
    top: 22%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: auto;
    height: 110vh;
    pointer-events: none;
}
</style>
