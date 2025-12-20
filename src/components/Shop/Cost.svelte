<script>
    import { displayNumber } from "../../utils";
    import Item from "./../Item/Item.svelte";

    export let value = 0;
</script>

<span class="cost">
    <Item mode="small" style="width:15px;" /> {displayNumber(value, true, true)}
</span>

<style>
    .cost {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 1rem;
        color: #df7d24;
    }
</style>