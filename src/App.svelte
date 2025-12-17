<script>
    import Plate from "./components/Plate.svelte";
    import RainingItems from "./components/RainingItems.svelte";
    import Shop from "./components/Shop.svelte";
    import Fluid from "./components/Fluid.svelte";
    import GoldenItem from "./components/GoldenItem.svelte";
    import { theme } from "./store/theme";
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
