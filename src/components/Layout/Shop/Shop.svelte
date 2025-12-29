<script>
    import { fly } from 'svelte/transition';
    import { game } from '../../../store/game';
    import Buildings from './Buildings.svelte';
    import Button from '../Button.svelte';
    import Upgrades from '../Dashboard/Upgrades.svelte';
</script>

{#if $game.displayShop}
    <div id="shop" class="border wooden" transition:fly={{ x: 150, duration: 150 }}>

        <div class="amounts">
            {#each $game.amounts as m}
                <Button selected={m == $game.amount} onClick={() => game.setAmount(m)} size="sm">
                    <span>{m}</span>
                </Button>
            {/each}
        </div>

        <Upgrades />

        <Buildings />
    </div>
{/if}

<style>
    #shop {
        height: calc(100dvh - 130px);
        z-index: 2;
        min-width: 20%;
        max-width: 480px;
        padding: 10px;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('/img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        background-size: contain;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
        padding-top: 30px;
    }

    .amounts {
        z-index: 3;
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        position: absolute;
        top: -10px;
    }

    @media (max-width: 768px) {
        #shop {
            height: calc(100dvh - 100px);
            width: calc(100% - 30px);
            position: fixed;
            padding-top: 50px;
        }
        .amounts {
            top: 10px;
        }
    }
</style>
