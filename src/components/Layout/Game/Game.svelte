<script>
    import { fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { achievements } from "../../../store/achievements";
    import Journal from "../Journal/Journal.svelte";
    import Plate from "../Plate/Plate.svelte";
    import Settings from "../Settings/Settings.svelte";
    import Tooltip from "../Shop/Good/Tooltip.svelte";
    import Shop from "../Shop/Shop.svelte";
    import Popup from "./Popup.svelte";

</script>
<div id="game">
    <Plate />
    <Tooltip />
    <Journal />
    <Settings />
    <Shop />
    <div id="popup-container">
        {#if $achievements.newlyUnlocked.size > 0}
            <button class="close-all-btn" onclick={achievements.clearAll}>
                Close All ({$achievements.newlyUnlocked.size})
            </button>
        {/if}
        {#each $achievements.newlyUnlocked as id (id)}
            <div
                in:fly={{ y: 40, duration: 200 }}
                out:fly={{ y: 40, duration: 200 }}
                animate:flip={{ duration: 200 }}
            >
                <Popup data={$achievements.list.find(a => a.id === id)} onClick={() => achievements.clear(id)} />
            </div>
        {/each}
    </div>
</div>

<style>
    .close-all-btn {
        background: #e64a33;
        border: 4px solid #000;
        box-shadow: inset -4px -4px 0px 0px #801b10, inset 4px 4px 0px 0px #ff6b57;
        color: #fff;
        font-family: "dogicapixelbold", sans-serif;
        font-size: 14px;
        padding: 8px 16px;
        cursor: pointer;
        text-shadow: 2px 2px 0px #000;
        margin-bottom: 5px;
        text-transform: uppercase;
    }

    .close-all-btn:hover {
        background: #ff6b57;
    }

    .close-all-btn:active {
        box-shadow: inset 4px 4px 0px 0px #801b10, inset -4px -4px 0px 0px #ff6b57;
        padding-top: 10px;
        padding-bottom: 6px;
    }

    #game {
        height: calc(100vh - 70px);
        display: flex;
        z-index: 3;
        position: relative;
    }

    #popup-container {
        position: absolute;
        bottom: 0;
        left: 50%;
        z-index: 2;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    @media (max-width: 768px) {
        #game {
            flex-direction: column;
        }
        #popup-container {
            width: 80%;
            bottom: 5px;
        }
    }
</style>