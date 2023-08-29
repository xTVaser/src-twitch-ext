import "chota/dist/chota.css";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library.js";
import Panel from "@components/viewer/Panel.svelte";
import "./theme.css";
import chevronRight from "./img/chevron-right.svg";

registerIconLibrary("system", {
  resolver: (name) => {
    if (name === "chevron-right") return chevronRight;
  },
});

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/dist/shoelace");

const app = new Panel({
  target: document.body,
});

export default app;
