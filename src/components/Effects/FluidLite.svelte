<script>
    import { achievements } from "../../store/achievements";

    let level = $derived.by(() => {
      return 60 * ($achievements.unlocked.size / $achievements.list.length);
    });
</script>

<div
    class="fluid"
    style="--level: {level}%"
></div>

<style>
    .fluid {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    }

    /* liquid body */
    .fluid::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: var(--level);
        background: linear-gradient(
        to top,
            rgba(220,220,180,.6),
            rgba(255,255,240,.9)
        );
        transition: height .4s ease-out;
    }

    /* animated surface */
    .fluid::after {
        content: "";
        position: absolute;
        left: -50%;
        right: -50%;
        bottom: calc(var(--level) - 18px);
        height: 36px;
        background:
        radial-gradient(circle at 50% 50%,
            rgba(255,255,255,.9) 30%,
            rgba(255,255,255,0) 60%);
        opacity: .6;
    }
</style>
