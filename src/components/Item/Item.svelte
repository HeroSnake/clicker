<script>
    const props = $props();

    let link = $state('');
    let suffix = '';
    let ext = 'png';

    switch (props.mode) {
        case 'small':
            suffix = '-sm';
            break;
        case 'gold':
            suffix = '-gold';
            break;
    }

    link = `./img/item/item${suffix}.${ext}`;
</script>

<img src="{link}" style="{props.style}" alt="item" />

<style>
    img {
        width: 100%;
        user-select: none;
        pointer-events: none;
    }
</style>