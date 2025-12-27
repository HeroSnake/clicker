<script>
    import { fly } from 'svelte/transition';
    import { game } from '../../../store/game';
    import { display } from '../../../store/display';
    import Upgrades from './Upgrades.svelte';
    import Achievements from './Achievements.svelte';
</script>

{#if $game.displayDashboard}
    <div id="dashboard" class="border wooden" transition:fly={{ x: $display.device === "mobile" ? -150: 150, duration: 150 }}>
        <Upgrades />
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
        background-color: #000;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    #dashboard::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url('/img/textures/stone-tiles.png');
        background-repeat: repeat;
        background-size: cover;
        opacity: 0.25;
        pointer-events: none;
        z-index: 0;
    }

    @media (max-width: 768px) {
        #dashboard {
            height: calc(100dvh - 110px);
            width: calc(100% - 40px);
            position: fixed;
        }
    }
</style>
