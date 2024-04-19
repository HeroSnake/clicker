<script>
    import { game } from "./store/game";
    import { theme } from "./store/theme";

    const BASE_HEIGHT = 502

    $: height = Math.min(300, - BASE_HEIGHT + $game.upgrades.filter(u => u.stock >= 1).reduce((acc, u) => acc + u.stock, 0))

    $: style = `background: linear-gradient(to top, white, rgba(255, 255, 255, 0.05) 50%, transparent 65%, transparent 100%);`
</script>

<div class="fluid-container" style="bottom: {height}px; {style}">
    <div class="fluid-mask {$theme.name}" style="bottom: 0px"></div>
</div>

<style>
    .fluid-container {
        overflow: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
    }

    .fluid-mask {
        height: 560px;
        width: 200vw;
        position: absolute;
        left: 0;
        opacity: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
        background: url("/img/fluids/water.gif") repeat-x;
        background-size: auto 60%;
    }

    @keyframes slide {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-50%);
        }
    }
    .Banana {
        filter: hue-rotate(104deg);
        opacity: 0.7;
        animation: slide 30s linear infinite;
    }
    .Gland {
        filter: brightness(190%) grayscale(1);
        opacity: 0.9;
        animation: slide 100s linear infinite;
    }
</style>
