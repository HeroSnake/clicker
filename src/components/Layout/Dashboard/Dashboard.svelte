<script>
    import { fly } from 'svelte/transition';
    import { game } from '../../../store/game';
    import { display } from '../../../store/display';
    import Achievements from './Achievements.svelte';
</script>

{#if $game.displayDashboard}
    <div id="dashboard" class="border wooden" transition:fly={{ x: $display.device === "mobile" ? -150: 150, duration: 150 }}>
        <Achievements />
    </div>
{/if}

<style>
    #dashboard {
        z-index: 2;
        padding: 10px;
        width: 80%;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('/img/textures/stone-tiles.png');
        background-repeat: round;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    @media (max-width: 768px) {
        #dashboard {
            height: calc(100dvh - 100px);
            width: calc(100% - 30px);
            position: fixed;
        }
    }
</style>
