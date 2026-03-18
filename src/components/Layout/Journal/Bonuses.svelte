<script>
    import { game } from "../../../store/game";

    let bonuses = $derived([
        ...$game.bonuses.flatMap(bonus => {
            const level = bonus.level;
            const cost = game.getBonusCost({ ...bonus, level });

            return {
                ...bonus,
                __original: bonus,
                libelle: "bonus",
                cost,
                img: `./img/bonuses/${bonus.code}.png`,
                disabled: cost > $game.itemCount,
            };
        })
    ]);
</script>

<div class="bonuses">
    {#each bonuses as bonus}
        <button type="button" class="bonus interactive" aria-label="bonus"
            disabled={bonus.disabled}
            onclick={() => game.buyBonus(bonus.__original)}
            style:background-image="url('{bonus.img}')"
            onmouseenter={(e) => game.mouseEnterTooltip("shop", () => ({
                ...bonus,
                cost: bonus.cost,
                disabled: bonus.disabled,
                libelle: "bonus"
            }), e)}
            onmouseleave={game.mouseLeaveTooltip}
        >
        </button>
    {/each}
</div>

<style>
    .bonuses {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        justify-items: center;
        gap: 5px;
        margin-bottom: 10px;
    }

    .bonus {
        width: 60px;
        height: 60px;
        box-shadow: 0 0 12px 3px #000, 0 0 7px 2px #fff3;
    }
</style>
