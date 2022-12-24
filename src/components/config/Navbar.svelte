<script lang="ts">
  import {link, location} from 'svelte-spa-router'
</script>

<nav class="col-1 navbar is-marginless is-paddingless is-gutterless">
  <div class="row pt-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <div class="pure-u">
        Personal Best<br />Extension
      </div>
    </div>
  </div>
  <div class="row pt-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <a class="nav-link" class:active="{$location === '/games' || $location === '/'}" href="/games" use:link>
        <div class="pure-u">
          <sl-icon-button
            name="joystick"
            label="Edit"
            style="font-size: 2.5rem;"
          />
          <br />
          Games
        </div>
      </a>
    </div>
  </div>
  <div class="row pt-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <a class="nav-link" class:active="{$location === '/themes'}" href="/themes" use:link>
        <div class="pure-u">
          <sl-icon-button
            name="palette"
            label="Edit"
            style="font-size: 2.5rem;"
          />
          <br />
          Theme
        </div>
      </a>
    </div>
  </div>
</nav>

<style>
  main {
    font-family: "Rubik", sans-serif;
  }

  .navbar {
    background-color: #18181b;
    height: 100vh;
    border-right: 2px solid #6441a4;
    box-sizing: border-box;
  }
</style>
