<script>
    import { displayNumber } from "../../../../utils";
    import { game } from "../../../../store/game";

    const { data = {} } = $props();
</script>

{#if data.libelle === "upgrade"}

    <span>
        <b class="bonus">x{data.level + 1}</b> {data.name} efficiency
    </span>

    {#if data.type === "cursor"}
        <span>
            <span class="bonus">+{displayNumber(data.crit.bonus * 100)}%</span> crit chance
        </span>
    {/if}

{:else if data.libelle === "bonus"}
        <span>
            grants <span class="bonus">{displayNumber(data.increase)}{data.unit}</span> {data.detail}
        </span>
        <span>
            {#if data.unit === "x"}
                <span class="total">{displayNumber($game[data.code])}x</span> total production
            {:else if (data.unit === "%")}
                <span class="total">{displayNumber($game[data.code] * 100)}%</span> total
            {:else}
                <span class="total">{displayNumber($game[data.code])}{data.unit}</span> total
            {/if}
        </span>

{:else if data.libelle === "building"}
    {#if data.unlocked}
        <span>
            Each {data.name} produces <b class="bonus">{displayNumber(game.getBuildingProduction(data, true), false, true)}</b> per second
        </span>
        <span>
            {data.stock} {data.name}s produces a total of <b class="bonus">{displayNumber(game.getBuildingProduction(data), false, true)}</b> per second
        </span>
        {#if data.type === "cursor" && $game.crit.chance > 0}
            <span>
                <b class="total">+{displayNumber($game.crit.chance * 100)}%</b> <small>Crit chance</small>
                (<b class="total">x{displayNumber($game.crit.multiplier, true)}</b> <small> Crit multiplier</small>)
            </span>
        {/if}
    {:else}
        <span>???</span>
    {/if}
{/if}
