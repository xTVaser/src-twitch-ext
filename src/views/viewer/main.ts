import Panel from "@components/viewer/Panel.svelte";

const app = new Panel({
  target: document.body,
  props: {
    name: "world",
  },
});

export default app;
