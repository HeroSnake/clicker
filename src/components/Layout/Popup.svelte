<script>
    import Image from "./Shop/Good/Image.svelte";

	const { onClick, data = {} } = $props();
</script>

<button class="popup" onclick={() => onClick?.()}>
    <span class="title">New achievement unlocked !</span>
    <div class="head">
        <Image img={data.img} filter={data.filter} size="sm" />
        <div>
            <span class="name">{data.name}</span><br>
            <span class="description">{data.description}</span>
        </div>
    </div>
</button>

<style>
    .popup {
        color: #d1d1d1;
        padding: 10px;
        font-size: 1.2rem;
        white-space: normal;
        width: 300px;
        line-height: 1.2rem;
        background: url('/img/textures/wood-horizontal-dark.png');
        background-size: cover;
        box-shadow: 0 0 12px 12px rgba(0,0,0,0.4), inset 0 0 12px 12px rgba(0,0,0,0.7);

        border: 5px solid transparent;
        border-radius: 5px;
        border-image-width: 5px;
        border-image-repeat: repeat;
        border-image-slice: 10;
        border-image-source: url("/img/textures/stone-bricks.png");
    }

    .title {
        display: inherit;
        color: #ffd139;
        text-shadow: 0 0 8px #ffc400;
        margin-bottom: 10px;
    }

    .head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .name {
        font-size: 1.2rem;
    }

    .description {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .popup {
            width: calc(100% - 20px);
            font-size: 0.8rem;
        }
        .name {
            font-size: 1.2rem;
        }
        .description {
            font-size: 0.8rem;
        }
    }
</style>