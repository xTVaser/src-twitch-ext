import "chota/dist/chota.css";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";
import App from "./ConfigView.svelte";
// import global CSS last for overrides
import "./global.css";
import radioSvg from "./img/radio.svg";
import checkSvg from "./img/check.svg";
import chevronRight from "./img/chevron-right.svg";
import chevronDown from "./img/chevron-down.svg";

registerIconLibrary("system", {
  resolver: (name) => {
    if (name === "radio") return radioSvg;
    if (name === "check") return checkSvg;
    if (name === "chevron-right") return chevronRight;
    if (name === "chevron-down") return chevronDown;
  },
});

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/dist/shoelace");

const app = new App({
  target: document.body,
});

export default app;
