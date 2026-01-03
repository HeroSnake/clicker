<script>
    import { fly } from "svelte/transition";
    import { game } from "../../../store/game";
    import Achievements from "./Achievements.svelte";
</script>

{#if $game.displayJournal}
    <div
        id="journal"
        class="border wooden"
        in:fly={{ x: -40, duration: 200 }}
        out:fly={{ x: -40, duration: 200 }}
    >
        <Achievements />
    </div>
{/if}

<style>
    #journal {
        z-index: 2;
        padding: 10px;
        position: relative;
        overflow-y: scroll;
        background: url("/img/textures/stone-tiles.png");
        background-repeat: round;
        box-shadow: inset 0 0 12px 12px rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 768px) {
        #journal {
            height: calc(100% - 30px);
            width: calc(100% - 30px);
            position: absolute;
        }
    }
</style>
