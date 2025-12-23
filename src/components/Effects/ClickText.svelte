<script>
    import { onMount, onDestroy } from "svelte";
    import { display } from "../../store/display";

    const dpr = window.devicePixelRatio || 1;
    const TARGET_FPS = $display.device === "phone" ? 30 : 60;
    const FRAME_TIME = 1000 / TARGET_FPS;
    const fontCache = {
        normal: 'bold 25px BoldPixels',
        crit: 'bold 35px BoldPixels'
    };
    const pool = [];
    const active = [];

    let canvas;
    let ctx;
    let raf;
    let last = performance.now();
    let resizeObserver = new ResizeObserver(resizeCanvas);

    function resizeCanvas() {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function easeOutCubic(t) {
        const f = 1 - t;
        return 1 - f * f * f;
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
        resizeCanvas();
        raf = requestAnimationFrame(loop);

        resizeObserver.observe(canvas);
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
    });
</script>

<canvas bind:this={canvas} class="click-canvas"></canvas>

<style>
    .click-canvas {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
        z-index: 3;
    }
</style>
