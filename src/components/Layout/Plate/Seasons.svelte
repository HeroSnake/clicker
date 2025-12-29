<script>
    import { game } from "../../../store/game";
</script>

<div class="seasons">
    {#each $game.seasons as season}
        <button
            onclick={() => game.setSeason(season.id)}
            class="season-btn interactive"
            aria-label="season"
            style="background: url('./img/seasons/{season.id}.png');"
            disabled={season.id == 2}
        ></button>
    {/each}
</div>

<style>
    .seasons {
        display: flex;
        gap: 5px;
    }

    .season-btn {
        width: 50px;
        height: 50px;
        border: 2px solid #000;
        box-shadow: 0 0 12px 3px #000, 0 0 7px 2px #fff3;
    }

    @media (max-width: 768px) {
        .season-btn {
            width: 40px;
            height: 40px;
        }
    }
</style>
