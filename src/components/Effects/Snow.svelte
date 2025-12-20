<script>
    import { onMount, onDestroy } from 'svelte';

    let canvas;
    let ctx;
    let snowflakes = [];
    const NUM_SNOWFLAKES = 100;

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createSnowflakes(width, height) {
      snowflakes = [];
      for (let i = 0; i < NUM_SNOWFLAKES; i++) {
        snowflakes.push({
          x: random(0, width),
          y: random(0, height),
          radius: random(1, 4),
          speed: random(0.5, 2),
          angle: random(0, Math.PI * 2),
          swing: random(0.5, 1.5) // horizontal swing amplitude
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

      snowflakes.forEach(s => {
        // update position
        s.y += s.speed;
        s.x += Math.sin(s.angle) * s.swing;
        s.angle += 0.01;

        // reset if out of screen
        if (s.y > h) {
          s.y = -s.radius;
          s.x = random(0, w);
        }
        if (s.x > w) s.x = 0;
        if (s.x < 0) s.x = w;

        // draw
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    onMount(() => {
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
      draw();
    });

    onDestroy(() => {
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
