<script>
    import { onMount } from "svelte";
    export let itemsPerSecond, theme;

    $: numItems = 10 + (itemsPerSecond / (100 * itemsPerSecond)); // Number of itemCount to generate
    let itemCount = [];

    function generateItem() {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y, speedX, speedY;

        switch (side) {
            case 0: // top
                x = Math.random() * window.innerWidth;
                y = -100;
                speedX = (Math.random() - 0.5) * 2; // Random horizontal speed
                speedY = Math.random() * 2; // Random vertical speed
                break;
            case 1: // right
                x = window.innerWidth + 100;
                y = Math.random() * window.innerHeight;
                speedX = -Math.random() * 2; // Random horizontal speed
                speedY = (Math.random() - 0.5) * 2; // Random vertical speed
                break;
            case 2: // bottom
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 100;
                speedX = (Math.random() - 0.5) * 2; // Random horizontal speed
                speedY = -Math.random() * 2; // Random vertical speed
                break;
            case 3: // left
                x = -100;
                y = Math.random() * window.innerHeight;
                speedX = Math.random() * 2; // Random horizontal speed
                speedY = (Math.random() - 0.5) * 2; // Random vertical speed
                break;
        }

        const item = {
            x,
            y,
            speedX,
            speedY,
        };
        itemCount = [...itemCount, item];
    }

    function updateItems() {
        itemCount = itemCount.map((item) => ({
            ...item,
            x: item.x + item.speedX,
            y: item.y + item.speedY,
        }));

        itemCount = itemCount.filter((item) => {
            // Remove item if it's outside the window
            return (
                item.x > -100 &&
                item.x < window.innerWidth + 100 &&
                item.y > -100 &&
                item.y < window.innerHeight + 100
            );
        });

        // Generate new item if needed
        while (itemCount.length < numItems) {
            generateItem();
        }
    }

    onMount(() => {
        // Generate initial itemCount
        for (let i = 0; i < numItems; i++) {
            generateItem();
        }

        // Update item positions every frame
        const updateLoop = setInterval(updateItems, 1000 / 60); // 60 frames per second

        // Cleanup
        return () => clearInterval(updateLoop);
    });
</script>

<div class="itemCount">
    {#each itemCount as item}
        <img
            src="./img/{theme.img}"
            alt="{theme.name}"
            class="item"
            style="left: {item.x}px; top: {item.y}px; transform: rotate({Math.random() * 360}deg);"
        />
    {/each}
</div>

<style>
    .itemCount {
        opacity: 0.5;
        z-index: -2;
        position: absolute;
    }
    .item {
        position: absolute;
        width: 50px;
        height: auto;
        pointer-events: none;
        animation: rotation 5s linear infinite;
    }
</style>
