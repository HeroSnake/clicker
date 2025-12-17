<canvas class="glow"></canvas>

<style>
    .glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120px;
        height: 120px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: -1;

        background: radial-gradient(
            circle,
            rgba(255, 215, 0, 0.8) 0%,
            rgba(255, 215, 0, 0.4) 40%,
            rgba(255, 215, 0, 0.15) 60%,
            transparent 70%
        );

        filter: blur(6px);
        animation: glowPulse 1.2s ease-in-out infinite;
    }

    /* Glow pulse */
    @keyframes glowPulse {
        0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.6;
        }
        100% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
        }
    }
</style>