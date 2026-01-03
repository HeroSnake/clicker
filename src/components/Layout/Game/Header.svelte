<script>
    import { display } from "../../../store/display";
    import Item from "../../Item/Item.svelte";
    import SettingsButton from "../Settings/SettingsButton.svelte";
</script>

<div id="header">
    <Item mode="small" style="width:40px;" />
    <span class="title">Gland clicker</span>
    {#if $display.device === "desktop"}
        <SettingsButton />
    {/if}
</div>

<style>
    #header {
        display: flex;
        padding: 0 15px;
        align-items: center;
        position: relative;
        z-index: 3;
        gap: 20px;
        height: 70px;
    }

    #header::before {
        content: "";
        position: absolute;
        inset: 0;
        background: url('/img/textures/wooden-logs.png');
        filter: brightness(0.65);
        z-index: -1;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .title {
        text-transform: uppercase;
        font-size: 1.8rem;
    }
</style>
