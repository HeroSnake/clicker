<script>
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
    import AnimatedText from "./AnimatedText.svelte";

    let itemCount = $state(0);
    let production = $state(0);

    $effect(() => {
        itemCount = $game.itemCount;
        production = $game.production;
    })
</script>

<div id="stats">
    <span class="item-count">
        <b>
            <AnimatedText value={itemCount} format={(n) => displayNumber(n, true)} />
        </b>
        <span>glands</span>
    </span>
    <span class="item-per-click">
        <b>
            <AnimatedText value={production} format={(n) => displayNumber(n, true, true)} />
        </b>
        <small> per second</small>
    </span>
</div>

<style>
    #stats {
        color: #fff;
        position: absolute;
        top: 5vh;
        width: 100%;
        background-color: #0000007d;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        line-height: 2.5rem;
    }

    .item-count {
        font-size: 3rem;
    }

    .item-per-click {
        font-size: 2rem;
    }

    @media (max-width: 768px) {
        .item-count {
            font-size: 2.5rem;
        }

        .item-per-click {
            font-size: 1.5rem;
        }
    }
</style>