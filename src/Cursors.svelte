<script>
    export let cursors;

    function rotation(count) {

    }
</script>

{#each cursors as cursor, i}
<img
    src="./img/upgrades/cursor-v2.png"
    alt="Cursor"
    class="cursor"
    style="transform: rotate({rotation(i)}deg);"
/>
{/each}


<style>
    .cursor {
        position: absolute;
        left: 0;
        bottom: 0;
        height: auto;
        width: 100%;
        pointer-events: none;
    }
</style>
