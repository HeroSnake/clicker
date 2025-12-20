<script>
    import { theme } from "./../../store/theme";

    export let mode = '';
    export let style = '';

    $: link = getLink();

    const getLink = () => {
        let suffix = '';
        let ext = 'png';

        switch (mode) {
            case 'small':
                suffix = '-sm';
                break;
            case 'gold':
                suffix = '-gold';
                break;
        }

        return `./img/${$theme.code}/items/item${suffix}.${ext}`;
    }
</script>

<img src="{link}" style="{style}" alt="item" />

<style>
    img {
        width: 100%;
        user-select: none;
        pointer-events: none;
    }
</style>