<script>
    import { onMount, onDestroy } from "svelte";

    let canvas;
    let ctx;
    let dpr = window.devicePixelRatio || 1;

    const MAX = 128;
    const pool = [];
    const active = [];

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getText() {
        return pool.pop() || {};
    }

    function releaseText(t) {
        pool.push(t);
    }

    export function spawn(x, y, value, isCrit) {
        const t = getText();

        t.x = x;
        t.y = y;
        t.baseX = x;
        t.value = value;
        t.isCrit = isCrit;
        t.life = 0;
        t.duration = isCrit ? 2500 : 500;
        t.rise = isCrit ? 150 : 100;
        t.size = isCrit ? 40 : 32;
        t.drift = (Math.random() * 2 - 1) * (isCrit ? 30 : 15);

        active.push(t);
    }

    function update(dt) {
        for (let i = active.length - 1; i >= 0; i--) {
            const t = active[i];
            t.life += dt;

            if (t.life >= t.duration) {
                active[i] = active[active.length - 1];
                active.pop();
                releaseText(t);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const t of active) {
            const p = t.life / t.duration;
            const eased = easeOutCubic(p);

            const y = t.y - eased * t.rise;
            const x = t.baseX + t.drift * eased;
            const alpha = 1 - p;

            ctx.globalAlpha = alpha;
            ctx.font = `bold ${t.size}px BoldPixels`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (t.isCrit) {
                ctx.shadowColor = "rgb(0,0,0)";
                ctx.shadowBlur = 18;
                ctx.fillStyle = "rgb(255,136,0)";
            } else {
                ctx.shadowColor = "#000";
                ctx.shadowBlur = 6;
                ctx.fillStyle = "#fff";
            }

            ctx.fillText(t.value, x, y);
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    let last = performance.now();
    let raf;

    function loop(now) {
        const dt = now - last;
        last = now;

        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
    }

    onMount(() => {
        ctx = canvas.getContext("2d");
        resize();
        window.addEventListener("resize", resize);
        raf = requestAnimationFrame(loop);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
    });
</script>

<canvas bind:this={canvas} class="click-canvas"></canvas>

<style>
    .click-canvas {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 3;
    }
</style>
