<template>
  <div class="box">
    <el-upload
      ref="upload"
      class="upload-demo"
      drag
      :auto-upload="false"
      accept="video/mp4"
      :show-file-list="false"
      v-model:file-list="fileList"
      :limit="1"
      @exceed="exceed"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽至此 <em>点击上传</em></div>
    </el-upload>
    <div v-if="filePath">
      <el-form-item label="文件地址">
        {{ filePath }}
      </el-form-item>
      <el-form-item label="时间选择">
        <el-time-picker
          v-model="timeList"
          is-range
          editable
          range-separator="到"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>

      <el-button type="primary" @click="click">开始裁剪</el-button>
      <el-form-item label="消息">
        {{ logMessage }}
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type {
  UploadUserFile,
  UploadInstance,
  UploadRawFile,
} from "element-plus";
import { dayjs, genFileId } from "element-plus";

const logMessage = ref("");
const fileList = ref<UploadUserFile[]>([]);
const timeList = ref<[Date, Date]>([
  new Date(2016, 9, 1, 0, 0),
  new Date(2016, 9, 1, 1, 0),
]);
watch(
  () => fileList.value,
  (arr) => {
    console.log(arr);

    if (arr[0]) {
      console.log(arr[0].raw?.path);
    }
  },
  { deep: true, immediate: true }
);

const filePath = computed(() => {
  return fileList.value[0]?.raw?.path;
});

const click = () => {
  console.log(timeList.value);
  console.log(filePath.value);

  const [startDate, endDate] = timeList.value;

  const getSeconds = (date: Date) => {
    const day = dayjs(date);
    const hour = day.hour();
    const minute = day.minute();
    const second = day.second();
    return hour * 3600 + minute * 60 + second;
  };

  console.log(getSeconds(startDate), getSeconds(endDate));

  window.ipcRenderer.invoke("cut", {
    sourceFilePath: filePath.value,
    outFileName: "cut",
    startTime: getSeconds(startDate) + "",
    endTime: getSeconds(endDate) - getSeconds(startDate) + "",
  });
};

const upload = ref<UploadInstance>();

const exceed = (files: File[]) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

window.ipcRenderer.on("main-process-message", (_event, message: string) => {
  if (message.startsWith("frame")) {
    logMessage.value = message
      .split(" ")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .join("");
  } else {
    logMessage.value = "";
  }
});
</script>

<style scoped lang="less">
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  .upload-demo {
    width: 80%;
  }
}
</style>
