<script>
    import { Tween } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    const props = $props();
    let change = $state(false);

    const animatedValue = new Tween(props.value ?? 0, {
        duration: 400,
        easing: cubicOut
    });

    $effect(() => {
        if (typeof props.value === 'number') {
            animatedValue.target = props.value;
            change = false;
            requestAnimationFrame(() => change = true);
        }
    });
</script>

<span class:pop={change}>
    {props.format ? props.format(animatedValue.current) : animatedValue.current}
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