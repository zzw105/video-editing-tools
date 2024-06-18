<template>
  <div class="outFile">
    <div class="title">输出文件地址：</div>
    <el-input
      class="outFilePath"
      v-model="outFilePath"
      :disabled="isCut"
      readonly
      :title="outFilePath"
      @click="selectFilePath"
    />
    <div class="icon">/</div>
    <el-input
      v-model="outFileName"
      :disabled="isCut"
      class="outFileName"
      style="max-width: 600px"
      placeholder="Please input"
    >
      <template #append>
        <el-select
          v-model="select"
          placeholder="Select"
          :disabled="isCut"
          style="width: 90px"
        >
          <el-option label=".mp4" value=".mp4" />
        </el-select>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
interface propsType {
  isCut: boolean;
}
const fileFullPath = defineModel<string>({ required: true });
withDefaults(defineProps<propsType>(), {
  isCut: false,
});

const outFileName = ref("");
const outFilePath = ref("");
const select = ref("");
watch(
  () => [select.value, outFileName.value, outFilePath.value],
  () => {
    if (select.value && outFileName.value && outFilePath.value) {
      fileFullPath.value = `${outFilePath.value}\\${outFileName.value}${select.value}`;
    }
  }
);

// 合并地址
watch(
  () => fileFullPath.value,
  (value) => {
    if (value) {
      const arr = value?.split(/\\|\./);
      arr.pop();
      select.value = ".mp4";
      outFileName.value = arr.pop() ?? "";
      outFilePath.value = arr.join("\\");
    }
  },
  { immediate: true }
);

// 选择文件夹
const selectFilePath = async () => {
  const res = await window.ipcRenderer.invoke("file");
  res && (outFilePath.value = res);
};
</script>

<style scoped lang="less">
.outFile {
  display: flex;
  width: 88%;
  margin-bottom: 20px;
  align-items: center;
  .title {
    flex: 0 0 115px;
  }
  .icon {
    margin: 0 5px;
  }
  .outFileName {
    flex: 1 1.2 auto;
  }
}
</style>
