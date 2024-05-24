import { createMemoryHistory, createRouter } from "vue-router";

import VideoCropping from "../views/VideoCropping.vue";

const routes = [
  { path: "/", redirect: "/VideoCropping" },
  { path: "/VideoCropping", name: "VideoCropping", component: VideoCropping },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
