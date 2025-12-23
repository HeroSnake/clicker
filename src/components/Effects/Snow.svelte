<script>
    import { onMount, onDestroy } from 'svelte';

    const BASE_NUM_SNOWFLAKES = 100;
    const dpr = window.devicePixelRatio || 1;

    let canvas;
    let ctx;
    let raf;
    let snowflakes = [];
    let resizeObserver = new ResizeObserver(resizeCanvas);

    function resizeCanvas() {
        if (!canvas) return;

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createSnowflakes(canvas.width / dpr, canvas.height / dpr);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function createSnowflakes(width, height) {
        snowflakes = [];
        const numFlakes = width < 768 ? BASE_NUM_SNOWFLAKES / 3 : BASE_NUM_SNOWFLAKES;

        for (let i = 0; i < numFlakes; i++) {
            const z = Math.random(); // depth factor
            snowflakes.push({
                x: random(0, width),
                y: random(0, height),
                radius: random(1, 4) * z + 1,   // bigger depth = bigger flake
                speed: random(0.5, 2) * z + 0.5, // slower = closer to background
                angle: random(0, Math.PI * 2),
                swing: random(0.5, 1.5) * z
            });
        }
    }

    function draw() {
        if (!canvas) return;

        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        ctx.beginPath();
        for (const s of snowflakes) {
            s.y += s.speed;
            s.x += Math.sin(s.angle) * s.swing;
            s.angle += 0.01;

            // wrap around
            if (s.y > h) s.y = -s.radius;
            if (s.x > w) s.x = 0;
            if (s.x < 0) s.x = w;

            ctx.moveTo(s.x, s.y);
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        raf = requestAnimationFrame(draw);
    }

    onMount(() => {
        ctx = canvas.getContext('2d');
        resizeCanvas();
        draw();

        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
    });
</script>

<canvas bind:this={canvas} class="snow-canvas"></canvas>

<style>
.snow-canvas {
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    pointer-events:none;
    z-index: 0;
}
</style>
