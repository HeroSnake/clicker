<script>
    import { onMount, onDestroy } from "svelte";

    let canvas;
    let ctx;
    let drops = [];

    export let density = 300;      // number of raindrops
    export let speed = 12;         // fall speed
    export let wind = -1;          // horizontal drift
    export let length = 20;        // drop length
    export let opacity = 0.6;

    let w = 0;
    let h = 0;
    let raf;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        w = window.innerWidth;
        h = window.innerHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createDrops() {
        drops = [];
        for (let i = 0; i < density; i++) {
            drops.push({
                x: Math.random() * w,
                y: Math.random() * h,
                z: Math.random(), // depth
                speed: speed * (0.5 + Math.random()),
                length: length * (0.5 + Math.random())
            });
        }
    }

    function update() {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = `rgba(180, 200, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.lineCap = "round";

        for (const d of drops) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(
                d.x + wind * d.z,
                d.y + d.length
            );
            ctx.stroke();

            d.y += d.speed;
            d.x += wind * d.z;

            if (d.y > h) {
                d.y = -d.length;
                d.x = Math.random() * w;
            }
            if (d.x < -50 || d.x > w + 50) {
                d.x = Math.random() * w;
            }
        }

        raf = requestAnimationFrame(update);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");
        resize();
        createDrops();
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
