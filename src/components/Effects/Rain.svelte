<script>
    import { onMount, onDestroy } from "svelte";

    const props = $props();

    let canvas;
    let ctx;
    let raf;
    let drops = [];
    let resizeObserver = new ResizeObserver(resizeCanvas);

    const density = 300;
    const speed = 12;
    const wind = -1;
    const length = 20;
    const opacity = 0.6;

    let width = 0;
    let height = 0;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createDrops();
    }

    function createDrops() {
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
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = `rgba(180, 200, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        ctx.beginPath();
        for (const d of drops) {
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x + wind * d.z, d.y + d.length);

            d.y += d.speed;
            d.x += wind * d.z;

            if (d.y > height) d.y = -d.length;
            if (d.x < -50 || d.x > width + 50) d.x = Math.random() * width;
        }
        ctx.stroke();

        raf = requestAnimationFrame(update);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");
        resizeCanvas();
        update();
        resizeObserver.observe(props.target);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
    });
</script>

<canvas bind:this={canvas} class="rain"></canvas>

<style>
    .rain {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
    }
</style>
