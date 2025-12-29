<script>
    import { achievements } from "../../../store/achievements";
    import Tooltip from "../Shop/Good/Tooltip.svelte";
    import Achievement from "./Achievement.svelte";

    let achievementList = $derived(
        $achievements.list.flatMap((a) => {
            const unlocked = $achievements.unlocked.has(a.id);
            return {
                ...a,
                unlocked,
                img: unlocked ? a.img : "./img/achievements/locked.png",
            };
        }),
    );

    let completion = $derived(
        (
            ($achievements.unlocked.size / $achievements.list.length) *
            100
        ).toFixed(2),
    );
</script>

<span class="title"
    >Achievements <small
        >{$achievements.unlocked.size} / {$achievements.list.length} ({completion}%)</small
    ></span
>
<div class="achievements">
    {#each achievementList as achievement}
        <Tooltip
            data={achievement}
            parent="dashboard"
            disabled={!achievement.unlocked}
        >
            <Achievement {achievement} />
        </Tooltip>
    {/each}
</div>

<style>
    .title {
        font-size: 1.6rem;
        text-shadow:
            4px 4px 12px rgba(0, 0, 0, 1),
            0 0 8px rgba(0, 0, 0, 1);
    }
    .achievements {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        justify-items: center;
        position: relative;
    }
</style>
