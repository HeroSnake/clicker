<script>
    import { theme } from "../../store/theme";
    import { game } from "../../store/game";
    import { displayNumber } from "../../utils";
</script>

<div id="stats">
    <span class="item-count">
        <b>{displayNumber($game.itemCount, true)}</b> {$theme.name}s
    </span>
    <span class="item-per-click">
        <b>{displayNumber($game.production, true, true)}</b>
        <small>per second</small>
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