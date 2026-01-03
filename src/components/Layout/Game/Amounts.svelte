<script>
    import { fly } from "svelte/transition";
    import { display } from "../../../store/display";
    import { game } from "../../../store/game";
    import Cost from "../Shop/Good/Cost.svelte";
    import Button from "./Button.svelte";
</script>

{#if $game.displayShop}
    <div id="amounts"
        in:fly={{ x: 40, duration: 150 }}
        out:fly={{ x: 40, duration: 150 }}
    >
        {#if $display.device === "mobile"}
            <Cost value={$game.itemCount} />
        {/if}
        {#each $game.amounts as m}
            <Button selected={m == $game.amount} onClick={() => game.setAmount(m)} size="sm">
                <span>{m}</span>
            </Button>
        {/each}
        <span></span>
    </div>
{/if}

<style>
    #amounts {
        z-index: 3;
        display: flex;
        flex-direction: row;
        gap: 5px;
        align-items: center;
        position: absolute;
        top: 50px;
        right: 0;
    }

    @media (max-width: 768px) {
        #amounts {
            top: 40px;
        }
    }
</style>