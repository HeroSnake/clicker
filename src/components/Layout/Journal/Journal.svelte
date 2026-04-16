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
        <button class="close-btn" onclick={game.toggleJournal}>X</button>
        <Achievements />
    </div>
{/if}

<style>
    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        background: #e64a33;
        border: 4px solid #000;
        box-shadow: inset -4px -4px 0px 0px #801b10, inset 4px 4px 0px 0px #ff6b57;
        color: #fff;
        font-family: "dogicapixelbold", sans-serif;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        text-shadow: 2px 2px 0px #000;
    }

    .close-btn:hover {
        background: #ff6b57;
    }

    .close-btn:active {
        box-shadow: inset 4px 4px 0px 0px #801b10, inset -4px -4px 0px 0px #ff6b57;
        padding-top: 4px;
        padding-left: 4px;
    }

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
