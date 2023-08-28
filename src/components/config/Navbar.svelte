<script lang="ts">
  import { link, location } from "svelte-spa-router";
  import logo from "./img/logo.png";
  import joystickSvg from "./img/joystick.svg";
  import paletteSvg from "./img/palette.svg";
</script>

<nav class="col navbar is-marginless is-gutterless">
  <div class="row p-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <div>
        <img src={logo} alt="Extension logo" class="logo" />
      </div>
    </div>
  </div>
  <div class="row p-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <a
        class="nav-link"
        class:active={$location === "/games" || $location === "/"}
        href="/games"
        use:link
      >
        <div>
          <sl-icon-button
            src={joystickSvg}
            label="Edit"
            style="font-size: 2.5rem;"
          />
          <br />
          <strong>Games</strong>
        </div>
      </a>
    </div>
  </div>
  <div class="row p-1 is-marginless">
    <div class="col is-center text-center is-marginless">
      <a
        class="nav-link"
        class:active={$location === "/themes"}
        href="/themes"
        use:link
      >
        <div>
          <sl-icon-button
            src={paletteSvg}
            label="Edit"
            style="font-size: 2.5rem;"
          />
          <br />
          <strong>Theme</strong>
        </div>
      </a>
    </div>
  </div>
</nav>

<style>
  .p-1 {
    padding: 0.5em;
  }

  .navbar {
    background-color: #18181b;
    height: 100vh;
    border-right: 2px solid #6441a4;
    box-sizing: border-box;
    flex: 0 0 auto;
    padding: 0.5em;
  }

  .logo {
    width: 50px;
  }
</style>
