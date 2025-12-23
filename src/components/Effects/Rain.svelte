<script>
    import { onMount, onDestroy } from "svelte";

    const density = 300;
    const speed = 12;
    const wind = -1;
    const length = 20;
    const opacity = 0.6;
    const dpr = window.devicePixelRatio || 1;

    let canvas;
    let ctx;
    let raf;
    let drops = [];
    let resizeObserver = new ResizeObserver(resizeCanvas);

    function resizeCanvas() {
        if (!canvas) return;

        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createDrops(canvas.width / dpr, canvas.height / dpr);
    }

    function createDrops(width, height) {
        drops = [];
        const effectiveDensity = width < 768 ? density / 3 : density; // lighter on mobile
        for (let i = 0; i < effectiveDensity; i++) {
            const z = Math.random();
            drops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z,
                speed: speed * (0.5 + z),
                length: length * (0.5 + z)
            });
        }
    }

    function update() {
        if (!canvas) return;

        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = `rgba(180, 200, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        ctx.beginPath();
        for (const d of drops) {
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + wind * d.z, d.y + d.length);

            d.y += d.speed;
            d.x += wind * d.z;

            if (d.y > h) d.y = -d.length;
            if (d.x < -50 || d.x > w + 50) d.x = Math.random() * w;
        }
        ctx.stroke();

        raf = requestAnimationFrame(update);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");
        resizeCanvas();
        update();
        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
    });
</script>

<canvas bind:this={canvas} class="rain"></canvas>

<style>
    .rain {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        pointer-events:none;
        z-index: 0;
    }
</style>
