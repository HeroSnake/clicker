<script>
    import { displayNumber } from "../../../utils";
    import { game } from "../../../store/game";

    const props = $props();
</script>

{#if props.data.libelle === "upgrade"}

    <span>
        <b class="bonus">Double</b> {props.data.name} efficiency
    </span>

    {#if props.data.type === "cursor"}
        <span>
            <span class="bonus">+{displayNumber(props.data.crit.bonus * 100)}%</span> crit chance
        </span>
    {/if}

{:else if props.data.libelle === "bonus"}
        <span>
            <span class="bonus">+{displayNumber(props.data.increase)}{props.data.unit}</span> {props.data.detail}
        </span>
        <span>
            <span class="total">
                {props.data.unit === "%"
                    ? displayNumber($game[props.data.code] * 100) + "%"
                    : displayNumber($game[props.data.code]) + (props.data.unit || "")}
            </span>
            total
        </span>

{:else if props.data.libelle === "building"}
    {#if props.data.stock > 0}
        <span>
            Each {props.data.name} produces <b class="bonus">{displayNumber(game.getBuildingProduction(props.data, true), false, true)}</b> per second
        </span>
        <span>
            {props.data.stock} {props.data.name}s produces a total of <b class="bonus">{displayNumber(game.getBuildingProduction(props.data), false, true)}</b> per second
        </span>
        {#if props.data.type === "cursor"}
            <span>
                <b class="total">+{displayNumber($game.crit.chance * 100)}%</b> <small>Crit chance</small>
                (<b class="total">x{displayNumber($game.crit.multiplier, true)}</b> <small> Crit multiplier</small>)
            </span>
        {/if}
    {:else}
        <span>???</span>
    {/if}
{/if}
