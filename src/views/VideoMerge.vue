<template>
  <div class="VideoMerge">
    <div class="title">文件选择/拖拽排序</div>
    <VueDraggable v-model="fileList" :animation="150" target=".el-upload-list">
      <el-upload
        class="upload-demo"
        :auto-upload="false"
        accept="video/mp4"
        v-model:file-list="fileList"
        multiple
      >
        <template #trigger>
          <el-button type="primary">选择视频</el-button>
        </template>
      </el-upload>
    </VueDraggable>
    <template v-if="fileList.length">
      <div class="title">输出</div>
      <OutFile class="as-c" v-model="outFilePath" />
      <div class="btnList as-c">
        <el-button type="primary" @click="click()" v-if="!isCut">
          开始合并
        </el-button>
        <el-button type="danger" @click="stop" v-else>停止裁剪</el-button>
        <el-button type="primary" @click="seeFile" :disabled="!success">
          查看文件
        </el-button>
      </div>
    </template>
    <div class="messageBox as-c" v-if="isCut">
      <el-progress
        :text-inside="true"
        :stroke-width="22"
        :percentage="percentage"
        status="success"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, UploadUserFile } from "element-plus";
import { computed, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import OutFile from "../components/OutFile.vue";
import { FFmpegMessageMergeType, formatFFmpegMessage } from "../utils";

// 当前选择的文件
const fileList = ref<UploadUserFile[]>([]);
const outFilePath = ref("");

// 文件地址
const filePath = computed(() => {
  return fileList.value[0]?.raw?.path;
});
watch(
  () => filePath.value,
  (value) => {
    if (value) {
      const arr = value?.split("\\");
      arr.pop();
      outFilePath.value = arr.join("\\") + "\\merge.mp4";
    }
  }
);

const allSize = computed(() => {
  let size = 0;
  fileList.value.forEach((item) => {
    size += item.size || 0;
  });
  return size / 1024;
});

const isCut = ref(false);
const success = ref(false);

const click = async (config?: { checkIsFileExist: boolean }) => {
  const { checkIsFileExist = true } = config || {};
  const filePathList = fileList.value.map((item) => item.raw?.path);
  if (filePathList.includes(outFilePath.value)) {
    ElMessage.error("源文件不能与输出文件路径完全相同");
    return;
  }
  if (checkIsFileExist) {
    const res = await window.ipcRenderer.invoke(
      "isFileExist",
      outFilePath.value
    );
    if (res) {
      ElMessageBox.confirm("已存在相同文件名的文件，是否覆盖？", "警告", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        click({ checkIsFileExist: false });
      });
      return;
    }
  }
  console.log(fileList);

  window.ipcRenderer.invoke("merge", {
    filePathList,
    outFilePath: outFilePath.value,
  });
  isCut.value = true;
  success.value = false;
};

const seeFile = () => {
  window.ipcRenderer.invoke("openExplorer", [outFilePath.value]);
};

const FFmpegMessage = ref<FFmpegMessageMergeType | null>(null);

// 百分百进度
const percentage = computed(() => {
  if (!FFmpegMessage.value) {
    return 0;
  }
  console.log(FFmpegMessage.value.size, allSize.value);

  return +(
    (+FFmpegMessage.value.size.slice(0, -2) / allSize.value) *
    100
  ).toFixed(2);
});
window.ipcRenderer.on("main-process-message", (_event, message: string) => {
  console.log(message);
  if (message.startsWith("size=")) {
    FFmpegMessage.value = formatFFmpegMessage(message, "merge");
    console.log(FFmpegMessage.value);
  } else if (message.startsWith("[out")) {
    FFmpegMessage.value = null;
    isCut.value = false;
    success.value = true;
    ElMessage.success("裁剪完成");
  } else {
    // logMessage.value = "";
  }
});

// 停止
const stop = () => {
  window.ipcRenderer.invoke("kill");
  FFmpegMessage.value = null;
  isCut.value = false;
};
</script>

<style scoped lang="less">
.VideoMerge {
  display: flex;
  flex-direction: column;
  .title {
    font-size: 20px;
    font-weight: bold;
    margin: 20px 0 10px 0;
    &:nth-child(1) {
      margin: 0 0 10px 0;
    }
  }
  .messageBox {
    width: 80%;
    margin-top: 20px;
    :deep(.el-progress-bar__outer) {
      background-color: #e1e1e1;
    }
  }
}
</style>
