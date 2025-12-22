<script>
    import { onMount } from "svelte";
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";

    let canvas;
    let ctx;
    let drops = [];

    let numDrops = 0;

    $: {
        const totalStock = $game.buildings.reduce((sum, building) => sum + (building.stock || 0), 0);
        numDrops = Math.max(1, Math.min(totalStock / 10000 * 100));
    }

    // Watch for reset
    $: if ($game.itemCount == 1) {
        numDrops = 1;
    }

    class Drop {
        constructor(img) {
            this.img = img;
            this.reset();
        }

        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * -window.innerHeight;
            this.speed = Math.random() * 0.5 + 1;
            this.scale = Math.random() * 0.02 + 0.1; // scaling factor
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
        }

        update() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
            if (this.y > window.innerHeight + this.img.height * this.scale) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);

            const width = this.img.width * this.scale;
            const height = this.img.height * this.scale;

            // Calculate brightness: smallest = 0.02 scale → 1.5 (150%)
            // largest = 0.12 scale → 0.5 (50%)
            const minScale = 0.02;
            const maxScale = 0.12;
            let brightness = 0.5 + (maxScale - this.scale) / (maxScale - minScale) * 1.0;
            brightness = Math.min(Math.max(brightness, 0.5), 1.5); // clamp 50%-150%
            ctx.filter = `brightness(${brightness})`;

            ctx.drawImage(this.img, -width/2, -height/2, width, height);
            ctx.restore();
        }
    }

    let img = new Image();
    resetImg();

    $: if ($theme) {
        resetImg();
    }

    function resetImg() {
        img.src = `/img/${$theme.code}/items/item.png`;
    }

    function initDrops() {
        drops = [];
        for (let i = 0; i < numDrops; i++) {
            drops.push(new Drop(img));
        }
    }

    let animationFrame;
    function animate() {
        if (!canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let drop of drops) {
            drop.update();
            drop.draw(ctx);
        }
        animationFrame = requestAnimationFrame(animate);
    }

    onMount(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d");

        img.onload = () => {
            initDrops();
            animate();
        }

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDrops();
        });

        return () => cancelAnimationFrame(animationFrame);
    });
</script>

<canvas bind:this={canvas} id="raining-items"></canvas>

<style>
    #raining-items {
        position:absolute;
        top:0;
        left:0;
        pointer-events:none;
        z-index: -1;
    }
</style>
