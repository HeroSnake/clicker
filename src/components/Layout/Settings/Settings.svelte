<script>
    import { fly } from "svelte/transition";
    import { game } from "../../../store/game";
    import Button from "../Game/Button.svelte";
    import Seasons from "../Plate/Seasons.svelte";

    let resetTimeout;
    let stage = $state(1);
    let resetText = $derived.by(() => {
        switch (stage) {
            case 2:
                return "SURE ?";
            default:
                return "Reset Game";
        }
    });

    function reset() {
        // Clear any existing debounce timers
        if (resetTimeout) {
            clearTimeout(resetTimeout);
            resetTimeout = null;
        }

        stage = (stage + 1);

        if (stage === 3) {
            game.resetGame();
            stage = 1;
        } else {
            // Debounce: only set stage to 0 if timer runs out and not interrupted by another click
            resetTimeout = setTimeout(() => {
                stage = 1;
                resetTimeout = null;
            }, 5000);
        }
    }
</script>

{#if $game.displaySettings}
    <div
        id="settings"
        class="border wooden"
        in:fly={{ y: 40, duration: 200 }}
        out:fly={{ y: 40, duration: 200 }}
    >
        <span class="title">Settings</span>

        <span class="sub-title">Select season theme</span>
        <Seasons />

        <Button onClick={reset} size="lg">
            <span>{resetText}</span>
        </Button>
    </div>
{/if}

<style>
    .title {
        font-size: 1.8rem;
        text-shadow: 4px 4px 12px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 1);
    }

    .title {
        font-size: 1.2rem;
        text-shadow: 4px 4px 12px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 1);
    }

    #settings {
        z-index: 2;
        padding: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('/img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        background-size: contain;
        box-shadow: 0 0 12px 12px rgba(0, 0, 0, 0.2), inset 0 0 12px 12px rgba(0, 0, 0, 0.7);
        position: absolute;
        top: 50%;
        left: 50%;
        width: 500px;
        height: 500px;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    @media (max-width: 768px) {
        #settings {
            height: calc(100% - 30px);
            width: calc(100% - 30px);
            position: absolute;
        }
    }
</style>
