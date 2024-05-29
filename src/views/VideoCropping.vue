<template>
  <div class="VideoCropping">
    <div class="editBox" v-if="videoFilePath">
      <!-- 源文件 -->
      <div class="sourceFile">源文件:{{ filePath }}</div>

      <!-- 视频播放器 -->
      <div class="video">
        <video
          ref="videoRef"
          id="videoPlayer"
          controls
          :src="videoFilePath"
          @loadeddata="videoLoadeddata"
        ></video>
      </div>

      <!-- 滑动条 -->
      <div class="slider-demo-block">
        <el-slider
          v-model="sliderTime"
          range
          :max="videoDuration"
          :disabled="isCut"
          tooltip-class="noTooltip"
        />
      </div>

      <!-- 时间选择器 -->
      <div class="timeSelector">
        <div class="startTimeSelector">
          <div class="title">起始时间:</div>
          <el-time-picker
            v-model="inputTime[0]"
            :disabled="isCut"
            @change="(e:Date) => timePickerChange(e,0)"
          />
        </div>
        <div class="endTimeSelector">
          <div class="title">结束时间:</div>
          <el-time-picker
            v-model="inputTime[1]"
            :disabled="isCut"
            @change="(e:Date) => timePickerChange(e,1)"
          />
        </div>
      </div>

      <div class="outFile">
        <div class="title">文件地址：</div>
        <el-input
          class="outFilePath"
          v-model="outFilePath"
          readonly
          :title="outFilePath"
          @click="selectFilePath"
        />
        <div class="icon">/</div>
        <el-input
          v-model="outFileName"
          class="outFileName"
          style="max-width: 600px"
          placeholder="Please input"
        >
          <template #append>
            <el-select
              v-model="select"
              placeholder="Select"
              style="width: 90px"
            >
              <el-option label=".mp4" value=".mp4" />
              <!-- <el-option label=".mp5" value=".mp5" /> -->
            </el-select>
          </template>
        </el-input>
      </div>

      <!-- 交互按钮 -->
      <div class="btnList">
        <el-button type="primary" @click="click()" v-if="!isCut">
          开始裁剪
        </el-button>
        <el-button type="danger" @click="stop" v-else>停止裁剪</el-button>
        <el-button type="primary" @click="cancel" :disabled="isCut">
          取消选择
        </el-button>
        <el-button
          type="primary"
          @click="seeFile"
          :disabled="isCut || !completeFilePath"
        >
          查看文件
        </el-button>
      </div>

      <div class="messageBox" v-if="isCut">
        <el-progress
          :text-inside="true"
          :stroke-width="22"
          :percentage="percentage"
          status="success"
        />
      </div>
    </div>

    <!-- 上传组件 -->
    <div class="upload" v-else>
      <el-upload
        ref="upload"
        class="uploadBox"
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
import { ElMessage, ElMessageBox, genFileId } from "element-plus";
import { FFmpegMessageType, formatFFmpegMessage } from "../utils";

// 当前选择的文件
const fileList = ref<UploadUserFile[]>([]);
const outFilePath = ref("");
const outFileName = ref("");
const select = ref(".mp4");
const completeFilePath = ref("");

// 文件地址
const filePath = computed(() => {
  // return "C:\\Users\\zzw13\\Downloads\\a.mp4";
  return fileList.value[0]?.raw?.path;
});
watch(
  () => filePath.value,
  (value) => {
    if (value) {
      const arr = value?.split("\\");
      arr.pop();
      outFilePath.value = arr.join("\\");
      outFileName.value = "cut";
    }
  }
);

// video播放器url
const videoFilePath = computed(() => {
  return filePath.value ? "atom:///" + filePath.value : "";
});

const STANDARD_TIME_DIFFERENCE = 8 * 60 * 60 * 1000; // 标准时间差 8小时

const videoDuration = ref(0); // 视频最大时长
const sliderTime = ref<number[]>([0, 60]); // 滑动条时间
const inputTime = ref<Date[]>([]); // 时间选择器时间
const startTime = computed(() => sliderTime.value[0]); // 起始时间
const endTime = computed(() => sliderTime.value[1]); // 结束时间

// 监听滑动条时间变化时间选择器时间
watch(
  () => sliderTime.value,
  (time) => {
    inputTime.value = [
      new Date((time[0] - STANDARD_TIME_DIFFERENCE) * 1000),
      new Date((time[1] - STANDARD_TIME_DIFFERENCE) * 1000),
    ];
  }
);

// 暂停播放器并移动时间
const changeVideo = (time: number) => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = time;
  }
};

watch(() => startTime.value, changeVideo);
watch(() => endTime.value, changeVideo);

// 开始裁剪
const click = async (config?: { checkIsFileExist: boolean }) => {
  const { checkIsFileExist = true } = config || {};
  if (!filePath.value) {
    return;
  }
  const _outFilePath = `${outFilePath.value}\\${outFileName.value}${select.value}`;
  if (_outFilePath === filePath.value) {
    ElMessage.error("源文件不能与输出文件路径完全相同");
    return;
  }
  if (checkIsFileExist) {
    const res = await window.ipcRenderer.invoke("isFileExist", _outFilePath);
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

  const [startDate, endDate] = sliderTime.value;
  window.ipcRenderer.invoke("cut", {
    sourceFilePath: filePath.value,
    outFilePath: `${outFilePath.value}\\${outFileName.value}${select.value}`,
    startTime: startDate + "",
    endTime: endDate - startDate + "",
  });
  isCut.value = true;
};

const seeFile = () => {
  window.ipcRenderer.invoke("openExplorer", [completeFilePath.value]);
};

// 取消选择
const cancel = () => {
  fileList.value = [];
};

// 停止
const stop = () => {
  window.ipcRenderer.invoke("kill");
  FFmpegMessage.value = null;
  isCut.value = false;
};

// 时间选择器修改
const timePickerChange = (time: Date, index: number) => {
  sliderTime.value[index] =
    (time.valueOf() + STANDARD_TIME_DIFFERENCE * 1000) / 1000;
};

const videoRef = ref<HTMLVideoElement | null>(null);
// 视频加载完成
const videoLoadeddata = () => {
  if (videoRef.value) {
    const duration = Math.floor(videoRef.value.duration ?? 0);
    videoDuration.value = duration;
    sliderTime.value = [0, duration];
    setTimeout(() => {
      videoRef.value && (videoRef.value.currentTime = 0);
    }, 0);
  }
};

// 选择文件
const upload = ref<UploadInstance>();
const exceed = (files: File[]) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const selectFilePath = async () => {
  const res = await window.ipcRenderer.invoke("file");
  res && (outFilePath.value = res);
};

// ffmpeg信息
const FFmpegMessage = ref<FFmpegMessageType | null>(null);
const isCut = ref(false);
// 百分百进度
const percentage = computed(() => {
  if (!FFmpegMessage.value) {
    return 0;
  }
  const [hours, minutes, seconds] = FFmpegMessage.value.time
    .split(/\:|\./)
    .map(Number);
  const duration = sliderTime.value[1] - sliderTime.value[0];
  const nowTime = hours * 3600 + minutes * 60 + seconds;
  return +((nowTime / duration) * 100).toFixed(2);
});

// ffmpeg信息接受
window.ipcRenderer.on("main-process-message", (_event, message: string) => {
  if (message.startsWith("frame")) {
    FFmpegMessage.value = formatFFmpegMessage(message);
  } else if (message.startsWith("[out")) {
    FFmpegMessage.value = null;
    isCut.value = false;
    completeFilePath.value =
      outFilePath.value + "\\" + outFileName.value + ".mp4";
    ElMessage.success("裁剪完成");
  } else {
    // logMessage.value = "";
  }
});
</script>

<style scoped lang="less">
.VideoCropping {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  .upload {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    .uploadBox {
      width: 80%;
    }
  }
  .editBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;

    .video {
      width: 80%;
      max-width: 1000px;
      video {
        width: 100%;
      }
    }
    .timeSelector {
      display: flex;
      width: 100%;
      margin-bottom: 20px;
      :deep(.el-input) {
        width: 150px;
      }
      .startTimeSelector,
      .endTimeSelector {
        width: 50%;
        // margin: 0 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .outFile {
      display: flex;
      width: 80%;
      margin-bottom: 20px;
      align-items: center;
      .title {
        flex: 0 0 80px;
      }
      .icon {
        margin: 0 5px;
      }
      .outFileName {
        flex: 1 1.2 auto;
      }
    }
    .messageBox {
      width: 80%;
      margin-top: 20px;
      :deep(.el-progress-bar__outer) {
        background-color: #e1e1e1;
      }
    }
    .sourceFile {
      font-size: 18px;
      margin-bottom: 20px;
    }
  }
  .slider-demo-block {
    width: 80%;
  }
}
</style>
