<script setup>
import PixelCanvas from './components/PixelCanvas.vue'
</script>

<template>
  <PixelCanvas />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
