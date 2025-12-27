<script>
    import { fly } from 'svelte/transition';
    import { game } from '../../../store/game';
    import Buildings from './Buildings.svelte';
    import Button from '../Button.svelte';
</script>

{#if $game.displayShop}
    <div id="shop" class="border wooden" transition:fly={{ x: 150, duration: 150 }}>

        <div class="amounts">
            {#each $game.amounts as m}
                <Button selected={m == $game.amount} onclick={() => game.setAmount(m)}>
                    <span>{m}</span>
                </Button>
            {/each}
        </div>

        <Buildings />
    </div>
{/if}

<style>
    #shop {
        z-index: 2;
        min-width: 20%;
        max-width: 480px;
        padding: 10px;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        background: url('/img/textures/wood-vertical-dark.png');
        background-repeat: repeat;
        background-size: contain;
        box-shadow: inset 0 0 12px 12px rgba(0,0,0,0.7);
    }

    .amounts {
        display: flex;
        flex-direction: row;
        padding: 10px;
        gap: 10px;
        align-items: center;
    }

    @media (max-width: 768px) {
        #shop {
            height: calc(100dvh - 110px);
            width: calc(100% - 40px);
            position: fixed;
        }
    }
</style>
