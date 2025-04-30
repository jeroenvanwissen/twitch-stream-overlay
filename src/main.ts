import { createApp } from "vue";
import "./styles/index.scss";
import("./App.vue").then(({ default: App }) => {
  createApp(App).mount("#app");
});
