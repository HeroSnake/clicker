<script>
    import { achievements } from "../../../store/achievements";

    let achievementList = $derived($achievements.list
        .flatMap(a => {
            return {
                ...a,
                unlocked: $achievements.unlocked.has(a.id),
            };
        }));

    $effect(() => {
        console.log(achievementList);
    })

</script>

<!-- {#each achievement} -->
