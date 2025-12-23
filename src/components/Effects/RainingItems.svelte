<script>
    import { onMount, onDestroy } from "svelte";
    import { game } from "../../store/game";

    const props = $props();

    const img = Object.assign(new Image(), { src: "./img/item/item-sm.png" });

    let canvas;
    let ctx;
    let animationFrame;
    let drops = [];
    let resizeObserver = new ResizeObserver(resizeCanvas);

    let numDrops = $derived.by(() => {
        if ($game.itemCount == 1) {
            return 1;
        }

        const totalStock = $game.buildings.reduce((sum, building) => sum + (building.stock || 0), 0);
        return Math.max(1, Math.min(totalStock / 10000 * 100));
	});

    function resizeCanvas() {
        canvas.width = props.target.clientWidth;
        canvas.height = props.target.clientHeight;
        initDrops();
    }

    function initDrops() {
        drops = [];
        for (let i = 0; i < numDrops; i++) {
            drops.push(new Drop(img));
        }
    }

    class Drop {
        constructor(img) {
            this.img = img;
            this.reset();
        }

        reset() {
            this.x = Math.random() * props.target.clientWidth;
            this.y = Math.random() * -props.target.clientHeight;
            this.speed = Math.random() * 0.5 + 1;
            this.scale = Math.random() * 0.2 + 0.1; // scaling factor
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
        }

        update() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
            if (this.y > props.target.clientHeight + this.img.height * this.scale) {
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
        ctx = canvas.getContext("2d");

        img.onload = () => {
            resizeCanvas();
            animate();
        }

        resizeObserver.observe(props.target);
    });

    onDestroy(() => {
        cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
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
