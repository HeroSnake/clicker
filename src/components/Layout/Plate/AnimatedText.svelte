<script>
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    const { value = 0, format = null } = $props();
    let change = $state(false);

    const animatedValue = new Tween(value ?? 0, {
        duration: 400,
        easing: cubicOut
    });

    $effect(() => {
        if (typeof value === 'number') {
            animatedValue.target = value;
            change = false;
            requestAnimationFrame(() => change = true);
        }
    });
</script>

<span class:pop={change}>
    {format ? format(animatedValue.current) : animatedValue.current}
</span>

<style>
    .pop {
        animation: pop 0.15s ease-out;
    }

    @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
</style>