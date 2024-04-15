<script>
    import { onMount } from "svelte";

    onMount(() => {
        const canvas = document.getElementById('waterCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create SVG string for the wave
const svgString = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M0,50 Q25,30 50,50 T100,50" fill="rgba(30, 144, 255, 0.5)"></path>
    <path d="M0,50 Q25,70 50,50 T100,50" fill="rgba(30, 144, 255, 0.5)"></path>
  </svg>
`;

// Convert SVG string to Blob
const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
const url = URL.createObjectURL(blob);

// Create image object from SVG
const image = new Image();
image.src = url;

// Initial position
let x = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw image
  ctx.drawImage(image, x, 0, canvas.width, canvas.height);
  if (x < 0) {
    ctx.drawImage(image, x + canvas.width, 0, canvas.width, canvas.height);
  }

  // Update position
  x -= 1; // Adjust speed of horizontal movement
  if (x <= -canvas.width) {
    x = 0;
  }
}

// Start animation
animate();

    });

</script>

<canvas id="waterCanvas"></canvas>

<style>
    #waterCanvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
