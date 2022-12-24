<script lang="ts">
  import Router from 'svelte-spa-router'
  import Navbar from "@components/config/Navbar.svelte";
  import GameSettings from "@components/config/GameSettings.svelte";
  import ThemeSettings from "@components/config/ThemeSettings.svelte";

  const routes = {
    // Using named parameters, with last being optional
    '/games': GameSettings,

    // Wildcard parameter
    '/themes': ThemeSettings,

    // Catch-all
    // This is optional, but if present it must be the last
    '*': GameSettings,
  }

</script>

<div class="row is-marginless is-paddingless">
  <Navbar />
  <div class="col-11 content is-gutterless">
    <Router {routes}/>
  </div>
</div>

<style>
  .content {
    padding: 2em;
    height: 100vh;
    overflow: scroll;
  }
</style>
