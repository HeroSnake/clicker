<script>
    const props = $props();
</script>

<button
    {...props}
    class:selected={props.selected}
>
    <slot />
</button>

<style>
    .selected {
        box-shadow: 0 0 8px 3px #fff, 0 0 14px 3px #ffe56666;
        background: #353430;
        border-radius: 6px;
        border: 1.5px solid #fff;
        transition: box-shadow 0.15s, background 0.15s;
    }
</style>