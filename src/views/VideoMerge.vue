<template>
  <div class="VideoMerge">
    <div class="title">文件选择</div>
    <VueDraggable
      v-if="show"
      v-model="fileList"
      :animation="150"
      target=".el-upload-list"
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :auto-upload="false"
        accept="video/mp4"
        v-model:file-list="fileList"
        multiple
      >
        <template #trigger>
          <el-button type="primary">选择视频</el-button>
        </template>

        <template #tip>
          <div class="el-upload__tip">暂只支持MP4</div>
        </template>
      </el-upload>
    </VueDraggable>

    <div class="title" @click="change">文件排序</div>
    <VueDraggable ref="el" v-model="fileList">
      <div v-for="item in fileList" :key="item.name">
        {{ item.name }}
      </div>
    </VueDraggable>
  </div>
</template>

<script setup lang="ts">
import { UploadInstance, UploadUserFile } from "element-plus";
import { ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";

// 当前选择的文件
const fileList = ref<UploadUserFile[]>([]);
const show = ref(true);

const uploadRef = ref<UploadInstance>();

const change = () => {
  show.value = false;
  setTimeout(() => {
    show.value = true;
  }, 10);
  console.log(show);
};
</script>

<style scoped lang="less">
.VideoMerge {
  .title {
    font-size: 20px;
    font-weight: bold;
    margin: 20px 0 10px 0;
    &:nth-child(1) {
      margin: 0 0 10px 0;
    }
  }
}
</style>
