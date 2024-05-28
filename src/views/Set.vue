<template>
  <div>
    <el-button type="primary" @click="openTheLogFile">打开日志文件</el-button>
  </div>
</template>

<script setup lang="ts">
const openTheLogFile = () => {
  window.ipcRenderer.invoke("openExplorer", "logs");
};
</script>

<style scoped lang="less"></style>
