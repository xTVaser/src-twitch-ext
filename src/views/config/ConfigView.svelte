<script lang="ts">
  import Navbar from "@components/config/Navbar.svelte";
  import GameSettings from "@components/config/GameSettings.svelte";
</script>

<div class="pure-g">
  <Navbar />
  <div class="pure-u-11-12 content scroll-y">
    <GameSettings />
  </div>
</div>

<style>
  .pure-g [class*="pure-u"] {
    font-family: "Rubik", sans-serif;
  }
  .content {
    height: 100vh;
  }
  .scroll-y {
    overflow-y: scroll;
  }
</style>
