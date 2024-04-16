<script>
    export let theme, upgrades

    const BASE_HEIGHT = 502

    $: height = Math.min(300, - 0 + upgrades.filter(u => u.stock >= 1).reduce((acc, u) => acc + u.stock, 0))

    $: style = `background: linear-gradient(to top, white, rgba(255, 255, 255, 0.05) 50%, transparent 65%, transparent 100%);`
</script>

<div class="container" style="bottom: {height}px; {style}">
    <div class="fluid-1 fluid-mask {theme.name}" style="bottom: 0px"></div>
    <div class="fluid-2 fluid-mask {theme.name}" style="bottom: 0px"></div>
</div>

<style>
    .container {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
    }

    .fluid-1, .fluid-2 {
        height: 560px;
        width: 5076px;
        position: absolute;
        left: 0;
        opacity: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1)); /* Set opacity gradient from transparent to opaque */
    }
    .fluid-mask {
        opacity: 0.5;
        mix-blend-mode: multiply;
    }

    .fluid-1 {
        background: url("src/img/fluid-1.png") repeat-x;
        animation: slide 45s linear infinite;
    }

    .fluid-2 {
        background: url("src/img/fluid-2.png") repeat-x;
        animation: slide 60s linear infinite;
    }

    @keyframes slide {
        0% {
            transform: translate3d(0, 0, 0);
        }
        100% {
            transform: translate3d(-1692px, 0, 0);
        }
    }

    .Banana {
        filter: saturate(0%) sepia(100%) hue-rotate(300deg) brightness(100%) contrast(100%);
    }
    .Gland {
        filter: brightness(100%) saturate(0%) invert(100%) sepia(0%) hue-rotate(0deg);
    }
</style>
