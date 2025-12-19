<script>
    import { onMount, onDestroy } from "svelte";
    import { theme } from "./store/theme";
    import { displayMode } from "./store/display";
    import Plate from "./components/Plate/Plate.svelte";
    import RainingItems from "./components/Effects/RainingItems.svelte";
    import Shop from "./components/Shop/Shop.svelte";
    import Fluid from "./components/Effects/Fluid.svelte";
    import GoldenItem from "./components/Effects/GoldenItem.svelte";

    onMount(() => {
        displayMode.init();
    });

    onDestroy(() => {
        displayMode.destroy();
    });
</script>

<div id="game" style="background: url('/img/bg/{$theme.code}.png') no-repeat center center/cover;">
    <div class="lighting-overlay"></div>
    <GoldenItem />
    <RainingItems/>
    <Fluid/>
    <Plate/>
    <Shop/>
</div>

<style>
    #game {
        display: flex;
        width: 100%;
    }
    .lighting-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.5) 100%);
    }
</style>
