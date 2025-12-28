<script>
    const { mode = '', style = '' } = $props();

    let ext = 'png';
    let suffix = $derived.by(() => {
        switch (mode) {
            case 'small':
                return '-sm';
            case 'gold':
                return '-gold';
            default:
                return '';
        }
    });
    let link = $derived(`./img/item/item${suffix}.${ext}`);
</script>

<img src="{link}" style="{style}" alt="item" />

<style>
    img {
        width: 100%;
        user-select: none;
        pointer-events: none;
    }
</style>