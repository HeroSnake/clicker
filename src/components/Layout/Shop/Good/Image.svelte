<script>
    const { img = '', filter = '', size = 'md' } = $props();

    let dimension = $derived.by(() => {
        switch (size) {
            case "lg":
                return 100
            case "md":
                return 75
            case "sm":
                return 50
        }
    })
</script>

<div
    class="img"
    style:background-image="url('{img}')"
    style:filter={filter}
    style:height="{dimension}px"
    style:min-width="{dimension}px"
></div>

<style>
    .img {
        background-size: cover;
    }

    @media (max-width: 768px) {
        .img {
            min-width: 50px;
            height: 50px;
        }
    }
</style>