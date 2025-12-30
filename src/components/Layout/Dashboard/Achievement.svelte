<script>
    const { achievement } = $props();

    let style = $derived.by(() => {
        const res = `background-image: url(${achievement.img});`;
        if (achievement.unlocked) {
            return res + `filter:${achievement.filter}`;
        }
        return res;
    })
</script>

<div class="achievement" class:unlocked={achievement.unlocked} style={style}></div>

<style>
    .achievement {
        width: 60px;
        height: 60px;
        background-size: cover;
        box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.2), 0 0 7px 2px rgba(0, 0, 0, 0.2);
    }

    .achievement.unlocked:hover {
        filter: brightness(1.3);
        box-shadow: 0 0 12px 3px rgba(255, 255, 255, 0.2);
    }

    .achievement:not(.unlocked) {
        filter: grayscale(100) brightness(0.5);
        cursor: auto;
    }
</style>