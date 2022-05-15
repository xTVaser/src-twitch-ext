import Panel from "@components/Panel.svelte";

const app = new Panel({
  target: document.body,
  props: {
    name: "world",
  },
});

export default app;
