<script>
    import Cost from "./Cost.svelte";
    import Image from "./Image.svelte";

    const { data = {} } = $props();
</script>

<div class="head">
    <Image img={data.img} hue={data.hue} />
    <div>
        <div class="info">
            <span class="name">{data.name}</span>
            {#if data.cost}
                <Cost value={data.cost} />
            {/if}
        </div>
        <span class="description">{data.description}</span>
    </div>
</div>

<style>
    .head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    .name {
        font-size: 2rem;
    }

    .description {
        font-size: 1.1rem;
    }

    @media (max-width: 768px) {
        .name {
            font-size: 1.2rem;
        }
        .description {
            font-size: 0.8rem;
        }
    }
</style>
