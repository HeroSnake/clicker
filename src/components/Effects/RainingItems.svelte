<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";

    const img = Object.assign(new Image(), { src: "/img/item/item-sm.png" });

    let canvas;
    let ctx;
    let raf;

    let drops = [];

    // reactive amount
    let numDrops = $derived.by(() => {
        if ($game.itemCount === 1) return 1;

        const totalStock = $game.buildings.reduce(
            (sum, b) => sum + (b.stock || 0),
            0
        );

        return Math.max(1, Math.min((totalStock / 10000) * 100, 100));
    });

    function resize() {
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createDrop() {
        return {
            x: Math.random() * canvas.clientWidth,
            y: Math.random() * -canvas.clientHeight,
            speed: Math.random() * 0.5 + 1,
            scale: Math.random() * 0.6 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() * 2 - 1) * 0.02
        };
    }

    function resetDrop(d) {
        d.x = Math.random() * canvas.clientWidth;
        d.y = Math.random() * -canvas.clientHeight;
        d.speed = Math.random() * 0.5 + 1;
        d.scale = Math.random() * 0.2 + 0.1;
        d.rotation = Math.random() * Math.PI * 2;
        d.rotationSpeed = (Math.random() * 2 - 1) * 0.02;
    }

    function rebuildDrops() {
        drops.length = 0;
        for (let i = 0; i < numDrops; i++) {
            drops.push(createDrop());
        }
    }

    function updateAndDraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const d of drops) {
            d.y += d.speed;
            d.rotation += d.rotationSpeed;

            if (d.y > canvas.clientHeight + img.height * d.scale) {
                resetDrop(d);
            }

            const w = img.width * d.scale;
            const h = img.height * d.scale;

            // brightness based on scale
            const minScale = 0.02;
            const maxScale = 0.12;
            let brightness =
                0.5 + ((maxScale - d.scale) / (maxScale - minScale)) * 1.0;
            brightness = Math.min(Math.max(brightness, 0.5), 1.5);

            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);
            ctx.filter = `brightness(${brightness})`;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
        }

        raf = requestAnimationFrame(updateAndDraw);
    }

    $effect(() => {
        // rebuild when amount changes
        if (canvas && img.complete) {
            rebuildDrops();
        }
    })

    onMount(() => {
        ctx = canvas.getContext("2d");

        resize();
        window.addEventListener("resize", resize);

        img.onload = () => {
            rebuildDrops();
            updateAndDraw();
        };
    });

    onDestroy(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
    });
</script>

<canvas bind:this={canvas} id="raining-items"></canvas>

<style>
    #raining-items {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        display: block;
    }
</style>
