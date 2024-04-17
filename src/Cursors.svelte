<script>
    export let cursors, upgrades;

    function generateCursors(count) {
        let data = []
        if(!document.getElementById("item-container")) {
            return data
        }
        const centerX = document.getElementById("item-container").offsetLeft + document.getElementById("item-container").offsetWidth / 2 - 10;
        const centerY = document.getElementById("item-container").offsetHeight + 120;

        let cursorRadius = 150;
        let angle = -Math.PI / 2; // Start at 12 o'clock position
        const angleIncrement = 0.0899; // Evenly divide the circle

        for (let i = 0; i < count; i++) {
            if (i % 70 === 0) {
                cursorRadius += 10;
            }
            const x = centerX + cursorRadius * Math.cos(angle);
            const y = centerY + cursorRadius * Math.sin(angle);
            const deltaX = centerX - x;
            const deltaY = centerY - y;
            const inclinaison = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
            data.push({ id: i, x, y, rotation: inclinaison });
            angle += angleIncrement;
        }

        return data;
    }
    $:cursors = generateCursors(upgrades.find(u => u.id == 0).stock)
    window.addEventListener('resize', () => cursors = generateCursors(upgrades.find(u => u.id == 0).stock))
</script>

<!-- {#each cursors as cursor} -->
<img
    src="./img/cursor-v2.png"
    alt="Cursor"
    class="cursor"
/>
<!-- {/each} -->


<style>
    .cursor {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 100%;
        width: auto;
        pointer-events: none;
    }
</style>
