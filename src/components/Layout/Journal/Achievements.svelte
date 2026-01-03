<script>
    import { achievements } from "../../../store/achievements";
    import { game } from "../../../store/game";
    import Achievement from "./Achievement.svelte";

    let achievementList = $derived(
        $achievements.list.flatMap((a) => {
            const unlocked = $achievements.unlocked.has(a.id);
            return {
                ...a,
                unlocked,
                img: unlocked ? a.img : "./img/item/locked.png",
            };
        }),
    );
</script>

<span class="title">Achievements <small>{$achievements.unlocked.size} / {$achievements.list.length} {$achievements.completion}(%)</small></span>
<div class="achievements">
    {#each achievementList as achievement}
        <button onmouseenter={(e) => game.mouseEnterTooltip("journal", { ...achievement, disabled: !achievement.unlocked }, e)} onmouseleave={game.mouseLeaveTooltip}>
            <Achievement {achievement} />
        </button>
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
        grid-template-columns: repeat(6, 1fr);
        gap: 5px;
        justify-items: center;
        position: relative;
    }
</style>
