<template>
  <div>
    <a href="https://electron-vite.github.io" target="_blank">
      <img src="/electron-vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <div @click="click">11111</div>
</template>

<script setup lang="ts">
import { ipcRenderer } from "electron/renderer";
import HelloWorld from "./components/HelloWorld.vue";
const channel = new MessageChannel();
const click = () => {
  const port1 = channel.port1;
  port1.postMessage({ answer: 42 });
  ipcRenderer.postMessage("port", null, [port1]);
};
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
