<script>
    const { size = "md", onClick, selected = false, children = null } = $props();

    let width = $derived.by(() => {
        switch (size) {
            case "lg":
                return 120
            case "md":
                return 100
            case "sm":
                return 60
        }
    })

    let height = $derived.by(() => {
        switch (size) {
            case "lg":
                return 50
            case "md":
                return 50
            case "sm":
                return 36
        }
    })
</script>

<button class:selected={selected} onclick={() => onClick?.()} style="background-image: url('/img/textures/brick-{size}.png');height:{height}px;width:{width}px">
    {@render children()}
</button>

<style>
    button {
        background-size: cover;
        text-align: center;
        font-weight: bold;
        font-size: 1.2rem;
        text-transform: uppercase;
    }

    button:hover {
        filter: brightness(1.5);
        transition: brightness 0.15s;
    }

    .selected {
        filter: brightness(1.8);
        transition: brightness 0.15s;
    }
</style>
