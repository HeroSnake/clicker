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