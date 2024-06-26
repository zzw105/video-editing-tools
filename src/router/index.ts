import { createMemoryHistory, createRouter } from "vue-router";

import VideoCropping from "../views/VideoCropping.vue";
import VideoMerge from "../views/VideoMerge.vue";
import Set from "../views/Set.vue";

const routes = [
  { path: "/", redirect: "/VideoCropping" },
  { path: "/VideoCropping", name: "VideoCropping", component: VideoCropping },
  { path: "/VideoMerge", name: "VideoMerge", component: VideoMerge },
  { path: "/Set", name: "Set", component: Set },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
