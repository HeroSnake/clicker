<script>
	import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { flip } from "svelte/animate";
	import { game } from "../../../store/game";
	import Item from "../../Item/Item.svelte";

	let now = Date.now();

	onMount(() => {
		let raf;
		const tick = () => {
			now = Date.now();
			raf = requestAnimationFrame(tick);
		};
		tick();

		return () => cancelAnimationFrame(raf);
	});

	function progress(boost) {
		const total =
			boost.expiresAt - boost.startedAt;

		const remaining =
			Math.max(0, boost.expiresAt - now);

		return remaining / total;
	}
</script>

<div class="boosts">
	{#each $game.activeBoosts as boost (boost)}
		<div class="boost"
            in:fly={{ y: -40, duration: 200 }}
            out:fly={{ y: -40, duration: 200 }}
            animate:flip={{ duration: 200 }}
        >
			<div
				class="loader"
				style="--progress: {progress(boost) * 100}%"
			>
				<div class="img">
					<Item mode="gold" />
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.boosts {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		gap: 0.75rem;
		z-index: 1;
	}

	.boost {
		position: relative;
	}

	/* Circular loader */
	.loader {
		--size: 40px;
		--thickness: 4px;

		width: var(--size);
		height: var(--size);
		border-radius: 50%;

		display: grid;
		place-items: center;

		background:
			conic-gradient(
				#000 var(--progress),
				transparent 0
			);
	}

	/* Cutout center */
	.loader::before {
		content: "";
		position: absolute;
		inset: var(--thickness);
		background: transparent;
		border-radius: 50%;
		z-index: 0;
	}

	.img {
		position: relative;
		width: 20px;
		height: 20px;
		z-index: 1;
		display: grid;
		place-items: center;
	}
</style>
