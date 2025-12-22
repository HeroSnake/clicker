<script>
    import { onMount, onDestroy } from "svelte";

    let canvas;
    let ctx;
    let dpr = window.devicePixelRatio || 1;

    const pool = [];
    const active = [];

    const fontCache = {
        normal: 'bold 25px BoldPixels',
        crit: 'bold 35px BoldPixels'
    };

    const isMobile = window.innerWidth < 768;
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    function easeOutCubic(t) {
        const f = 1 - t;
        return 1 - f * f * f;
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
        t.duration = isCrit ? 5000 : 2500;
        t.rise = isCrit ? 150 : 100;
        t.size = isCrit ? 35 : 25;
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
            } else {
                t._progress = t.life / t.duration;
                t._eased = easeOutCubic(t._progress);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const t of active) {
            const y = t.y - t._eased * t.rise;
            const x = t.baseX + t.drift * t._eased;
            const alpha = 1 - t._progress;

            ctx.globalAlpha = alpha;
            ctx.font = t.isCrit ? fontCache.crit : fontCache.normal;
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

        if (dt >= FRAME_TIME) {
            last = now;
            update(dt);
            draw();
        }

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
