<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

// Configuration
const PIXEL_FACTOR = 10; // Pixels per virtual pixel (higher = bigger pixels)
const WS_URL = 'ws://localhost:3001/ws';

const canvasContainer = ref(null);
let scene, camera, renderer, ws;
let pixelMeshes = [];
let pixelMap = new Map(); // Map to store pixels by "x,y" key
let gridDimensions = { cols: 0, rows: 0 };
let receivedColors = 0;

// Calculate grid dimensions based on window size and pixel factor
const getGridDimensions = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cols = Math.ceil(width / PIXEL_FACTOR);
  const rows = Math.ceil(height / PIXEL_FACTOR);
  return { cols, rows, width, height };
};

// Initialize Three.js scene
const initScene = () => {
  const { cols, rows, width, height } = getGridDimensions();

  // Store grid dimensions
  gridDimensions = { cols, rows };

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera (orthographic for 2D pixel grid)
  camera = new THREE.OrthographicCamera(
    0, width,
    0, height,
    0.1, 1000
  );
  camera.position.z = 10;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(width, height);
  canvasContainer.value.appendChild(renderer.domElement);

  // Create pixel grid
  createPixelGrid(cols, rows);
};

// Create the pixel grid
const createPixelGrid = (cols, rows) => {
  const geometry = new THREE.PlaneGeometry(PIXEL_FACTOR, PIXEL_FACTOR);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mesh = new THREE.Mesh(geometry, material);

      // Position the pixel
      mesh.position.x = x * PIXEL_FACTOR + PIXEL_FACTOR / 2;
      mesh.position.y = y * PIXEL_FACTOR + PIXEL_FACTOR / 2;
      mesh.position.z = 0;

      scene.add(mesh);

      const pixelData = { mesh, x, y, requested: false };
      pixelMeshes.push(pixelData);
      pixelMap.set(`${x},${y}`, pixelData);
    }
  }
};

// Initialize WebSocket connection
const initWebSocket = () => {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('Connected to WebSocket server');
    console.log(`Grid dimensions: ${gridDimensions.cols}x${gridDimensions.rows} = ${pixelMeshes.length} pixels`);
    requestPixelColors();
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'pixelColor') {
      const { x, y, color } = data;
      const pixelData = pixelMap.get(`${x},${y}`);

      if (pixelData) {
        const { r, g, b } = color;
        const hex = (r << 16) | (g << 8) | b;
        pixelData.mesh.material.color.setHex(hex);

        receivedColors++;
        if (receivedColors % 1000 === 0 || receivedColors === pixelMeshes.length) {
          console.log(`Received ${receivedColors}/${pixelMeshes.length} pixel colors`);
        }
      } else {
        console.warn(`Pixel not found for coordinates: ${x},${y}`);
      }
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Attempt reconnection after 3 seconds
    setTimeout(() => {
      if (canvasContainer.value) {
        initWebSocket();
      }
    }, 3000);
  };
};

// Request colors for all pixels
const requestPixelColors = () => {
  pixelMeshes.forEach(({ x, y, requested }) => {
    if (!requested && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'getPixelColor',
        x,
        y
      }));
    }
  });
};

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Handle window resize
const handleResize = () => {
  const { width, height } = getGridDimensions();

  camera.right = width;
  camera.top = height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

// Lifecycle hooks
onMounted(() => {
  initScene();
  initWebSocket();
  animate();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);

  if (ws) {
    ws.close();
  }

  if (renderer) {
    renderer.dispose();
  }

  pixelMeshes.forEach(({ mesh }) => {
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
});
</script>

<template>
  <div ref="canvasContainer" class="pixel-canvas"></div>
</template>

<style scoped>
.pixel-canvas {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
