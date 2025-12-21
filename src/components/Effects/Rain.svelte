<script>
    import { onMount, onDestroy } from "svelte";

    let canvas;
    let ctx;
    let drops = [];
    let raf;

    export let density = 300;
    export let speed = 12;
    export let wind = -1;
    export let length = 20;
    export let opacity = 0.6;

    let w = 0;
    let h = 0;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        createDrops();
    }

    function createDrops() {
        drops = [];
        const effectiveDensity = w < 768 ? density / 3 : density; // lighter on mobile
        for (let i = 0; i < effectiveDensity; i++) {
            const z = Math.random();
            drops.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z,
                speed: speed * (0.5 + z),
                length: length * (0.5 + z)
            });
        }
    }

    function update() {
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
        resize();
        update();
        window.addEventListener("resize", resize);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
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
