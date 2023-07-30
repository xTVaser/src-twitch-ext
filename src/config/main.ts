import "chota/dist/chota.css";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import App from "./ConfigView.svelte";
// import global CSS last for overrides
import "./global.css";

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/dist/shoelace");

const app = new App({
  target: document.body,
});

export default app;
