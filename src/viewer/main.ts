import "chota/dist/chota.css";
import "@shoelace-style/shoelace/dist/themes/dark.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import Panel from "@components/viewer/Panel.svelte";
import "./theme.css";

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/dist/shoelace");

const app = new Panel({
  target: document.body,
});

export default app;
