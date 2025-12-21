<script>
  import { onMount, onDestroy } from 'svelte';

  let canvas;
  let ctx;
  let snowflakes = [];
  let raf;

  const BASE_NUM_SNOWFLAKES = 100;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createSnowflakes(width, height) {
    snowflakes = [];
    const numFlakes = width < 768 ? BASE_NUM_SNOWFLAKES / 3 : BASE_NUM_SNOWFLAKES;

    for (let i = 0; i < numFlakes; i++) {
      const z = Math.random(); // depth factor
      snowflakes.push({
        x: random(0, width),
        y: random(0, height),
        radius: random(1, 4) * z + 1,   // bigger depth = bigger flake
        speed: random(0.5, 2) * z + 0.5, // slower = closer to background
        angle: random(0, Math.PI * 2),
        swing: random(0.5, 1.5) * z
      });
    }
  }

  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createSnowflakes(canvas.width / dpr, canvas.height / dpr);
  }

  function draw() {
    if (!canvas) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    ctx.beginPath();
    for (const s of snowflakes) {
      s.y += s.speed;
      s.x += Math.sin(s.angle) * s.swing;
      s.angle += 0.01;

      // wrap around
      if (s.y > h) s.y = -s.radius;
      if (s.x > w) s.x = 0;
      if (s.x < 0) s.x = w;

      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    raf = requestAnimationFrame(draw);
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    draw();
  });

  onDestroy(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  });
</script>

<canvas bind:this={canvas} class="snow-canvas"></canvas>

<style>
  .snow-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  }
</style>
