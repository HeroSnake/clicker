<script>
    export let cursors, upgrades;

    function generateCursors(count) {
        let data = []
        if(!document.getElementById("cookie-container")) {
            return data
        }
        const centerX = document.getElementById("cookie-container").offsetLeft + document.getElementById("cookie-container").offsetWidth / 2 - 10;
        const centerY = document.getElementById("cookie-container").offsetHeight + 120;

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

{#each cursors as cursor}
<img
    src="src/img/cursor.png"
    alt="Cursor"
    class="cursor"
    style="left: {cursor.x}px; top: {cursor.y}px; transform: rotate({cursor.rotation}deg);"
/>
{/each}


<style>
    .cursor {
        position: absolute;
        width: 20px;
        height: auto;
        pointer-events: none;
        z-index: 1;
    }
</style>
