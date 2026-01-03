<script>
    import { fly } from "svelte/transition";
    import { game } from '../../../store/game';
    import Buildings from './Buildings.svelte';
    import Upgrades from '../Journal/Upgrades.svelte';
</script>

{#if $game.displayShop}
    <div id="shop" class="border wooden"
        in:fly={{ x: 40, duration: 200 }}
        out:fly={{ x: 40, duration: 200 }}
    >
        <Upgrades />
        <Buildings />
    </div>
{/if}

<style>
    #shop {
        width: 420px;
        z-index: 2;
        padding: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('/img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        background-size: contain;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    @media (max-width: 768px) {
        #shop {
            height: calc(100% - 30px);
            width: calc(100% - 30px);
            position: absolute;
        }
    }
</style>
