<script>
    import { onMount } from "svelte";
    import { game } from "../../store/game";

    let canvas;
    let ctx;
    let animationFrame;

    let fluidHeight = 0;

    const BASE_HEIGHT = 502;

    // Multiple sine waves for natural motion
    const waves = [
        { amplitude: 10, length: 600, speed: 0.02 },
        { amplitude: 6, length: 300, speed: 0.015 },
        { amplitude: 4, length: 150, speed: 0.01 },
    ];

    let offsetsFront = waves.map(() => 0);
    let offsetsBack = waves.map(() => 0);

    $: fluidHeight = Math.min(
        300,
        $game.upgrades.filter(u => u.stock >= 1).reduce((acc, u) => acc + u.stock, 0)
    );

    function drawFluid() {
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const baseYFront = height - fluidHeight + 30;
        const baseYBack = height - fluidHeight; // slightly higher for depth

        // --- BACK FLUID (darker milk) ---
        const gradientBack = ctx.createLinearGradient(0, baseYBack - 20, 0, height);
        gradientBack.addColorStop(0, "rgba(230,230,200,0.8)");
        gradientBack.addColorStop(0.4, "rgba(240,240,210,0.7)");
        gradientBack.addColorStop(1, "rgba(220,220,180,0.6)");
        ctx.fillStyle = gradientBack;

        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x++) {
            let y = baseYBack;
            waves.forEach((wave, i) => {
                y += Math.sin((x / wave.length) * 2 * Math.PI + offsetsBack[i]) * wave.amplitude;
            });
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // --- FRONT FLUID (milk cartoonish with soft edge) ---
        const gradientFront = ctx.createLinearGradient(0, baseYFront - 30, 0, height);
        gradientFront.addColorStop(0, "rgba(255, 255, 240, 1)");     // top fully opaque
        gradientFront.addColorStop(0.2, "rgba(255, 255, 240, 0.8)");
        gradientFront.addColorStop(0.4, "rgba(255, 250, 230, 0.7)");
        gradientFront.addColorStop(0.7, "rgba(255, 245, 220, 0.6)");
        gradientFront.addColorStop(1, "rgba(255, 240, 210, 0.5)");
        ctx.fillStyle = gradientFront;

        ctx.beginPath();
        ctx.moveTo(0, height);
        const topEdgeY = [];
        for (let x = 0; x <= width; x++) {
            let y = baseYFront;
            waves.forEach((wave, i) => {
                y += Math.sin((x / wave.length) * 2 * Math.PI + offsetsFront[i]) * wave.amplitude;
            });
            topEdgeY.push(y);      // save top edge for glow
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // --- Soft glow along top edge ---
        ctx.save();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 20;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.globalAlpha = 1;
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
            if (x === 0) ctx.moveTo(x, topEdgeY[x]);
            else ctx.lineTo(x, topEdgeY[x]);
        }
        ctx.stroke();
        ctx.restore();

        // Advance offsets
        waves.forEach((wave, i) => {
            offsetsFront[i] += wave.speed;
            offsetsBack[i] += wave.speed; // same animation for both layers
        });

        animationFrame = requestAnimationFrame(drawFluid);
    }

    onMount(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d");

        drawFluid();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<canvas bind:this={canvas} id="fluid"></canvas>

<style>
    #fluid {
        position:absolute;
        bottom:0;
        left:0;
        width:100%;
        height:100%;
        pointer-events:none;
        z-index:1;
    }
</style>
