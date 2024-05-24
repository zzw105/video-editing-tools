<template>
  <div class="view">
    <div class="leftMenu">
      <div class="title">简单剪</div>
      <el-scrollbar class="scrollbar">
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="leftMenuBox"
          :default-active="activeIndex"
          text-color="#fff"
          @select="handleSelect"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><VideoPlay /></el-icon>
              <span>视频</span>
            </template>
            <el-menu-item index="VideoCropping">裁剪</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="rightContent">
      <el-scrollbar>
        <router-view />
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VideoPlay } from "@element-plus/icons-vue";
import { ref } from "vue";
import { router } from "../router";

const activeIndex = ref("VideoCropping");

const handleSelect = (key: string) => {
  router.push({ name: key });
};
</script>

<style lang="less">
.view {
  display: flex;
  width: 100%;
  height: 100px;
  .leftMenu {
    width: 200px;
    height: 100vh;
    background-color: #545c64;
    .scrollbar {
      height: calc(100vh - 50px);
    }
    .leftMenuBox {
      border: none;
    }
    .title {
      height: 50px;
      line-height: 50px;
      text-align: center;
      color: #fff;
      border-bottom: 1px solid #fff;
    }
  }
  .rightContent {
    flex: 1;
    width: 100%;
    height: 100vh;
    padding: 20px;
    background-color: #ececec;
    overflow: hidden;
  }
  .el-scrollbar__view {
    height: 100%;
  }
}
</style>
