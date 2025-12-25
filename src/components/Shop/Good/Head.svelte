<script>
    import Cost from "./Cost.svelte";
    import Image from "./Image.svelte";

    const props = $props();
</script>

<div class="head">
    <Image img={props.data.img} />
    <div>
        <div class="info">
            <span class="name">{props.data.name}</span>
            <Cost value={props.data.cost} />
        </div>
        <span class="description">{props.data.description}</span>
    </div>
</div>

<style>
    .head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    .info {
        display: flex;
        align-items: flex-start;
    }
    .name {
        font-size: 2rem;
    }

    .description {
        font-size: 1.1rem;
    }
</style>
