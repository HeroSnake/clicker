<script>
    export let itemsPerSecond, theme;

    $: numItems = Math.min(30, Math.floor(10 + (itemsPerSecond / 100)))
    let itemCount = [];

    function createFloatingImage() {
        let x = Math.random() * (window.innerWidth - 100) + 50;
        let y = Math.random() * (window.innerHeight - 100) + 50;
        let speed = Math.random() * 100 + 2
        let rotation = Math.random() * 360
        let randomNum = Math.floor(Math.random() * 4) + 1
        let animation = `floatAnimation${randomNum}`
        itemCount.push({x, y, speed, rotation, animation})
    }

    // Generate floating images
    $: for (let i = 0; i < numItems; i++) {
        createFloatingImage()
    }
</script>

{#each itemCount as item}
    <img
        src="./img/items/{theme.img}"
        alt="{theme.name}"
        class="item"
        style="
            left: {item.x}px;
            top: {item.y}px;
            transform: rotate({item.rotation}deg);"
    />
{/each}

<style>
    .item {
        position: absolute;
        width: 50px;
        height: auto;
        pointer-events: none;
        animation: floatAnimation1 linear infinite;
    }

    @keyframes floatAnimation1 {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        100% {
            transform: translate(calc(100vw - 50px), calc(100vh - 50px)) rotate(360deg);
        }
    }
    @keyframes floatAnimation2 {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        100% {
            transform: translate(calc(100vw - 50px), calc(100vh - 50px)) rotate(360deg);
        }
    }
    @keyframes floatAnimation3 {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        100% {
            transform: translate(calc(100vw - 50px), calc(100vh - 50px)) rotate(360deg);
        }
    }
    @keyframes floatAnimation4 {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        100% {
            transform: translate(calc(100vw - 50px), calc(100vh - 50px)) rotate(360deg);
        }
    }
</style>
