<script>
    import { onMount, onDestroy } from "svelte";
    import { displayMode } from "./store/display";
    import Header from "./components/Layout/Header.svelte";
    import Plate from "./components/Layout/Plate.svelte";
    import Shop from "./components/Shop/Shop.svelte";

    onMount(() => {
        displayMode.init();
    });

    onDestroy(() => {
        displayMode.destroy();
    });
</script>

<Header />
<div id="game">
    <Plate />
    <Shop />
</div>

<style>
    #game {
        width: 100%;
        height: 100%;
        display: flex;
    }
</style>
