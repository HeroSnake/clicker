<script>
    import Header from "./components/Layout/Header.svelte";
    import Plate from "./components/Layout/Plate.svelte";
    import Shop from "./components/Shop/Shop.svelte";
</script>

<Header />
<div id="game">
    <Plate />
    <Shop />
</div>

<style>
    #game {
        width: 100%;
        height: 100dvh;
        display: flex;
    }
</style>
