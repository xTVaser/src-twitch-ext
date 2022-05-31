<script lang="ts">
  import { Route, Router } from "svelte-navigator";
  import Navbar from "@components/config/Navbar.svelte";
  import GameSettings from "@components/config/GameSettings.svelte";
import ThemeSettings from "@components/config/ThemeSettings.svelte";
</script>

<Router basepath="/config">
  <div class="pure-g">
    <Navbar />
    <div class="pure-u-11-12 content scroll-y">
      <ThemeSettings />
      <!-- <Route path="games">
        <GameSettings />
      </Route>
      <Route path="themes">
        <ThemeSettings />
      </Route> -->
    </div>
  </div>
</Router>

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
