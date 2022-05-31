<script lang="ts">
  import { Link } from "svelte-navigator";
</script>

<nav class="pure-u-1-12 navbar">
  <div class="pure-g justify-content-center padding-1">
    <div class="pure-u">
      Personal Best<br />Extension
    </div>
  </div>
  <div class="pure-g justify-content-center padding-1">
    <Link class="nav-link active" to="/games">
      <div class="pure-u">
        <sl-icon-button
          name="joystick"
          label="Edit"
          style="font-size: 2.5rem;"
        />
        <br />
        Games
      </div>
    </Link>
  </div>
  <div class="pure-g justify-content-center padding-1">
    <Link class="nav-link" to="/themes">
      <div class="pure-u">
        <sl-icon-button
          name="palette"
          label="Edit"
          style="font-size: 2.5rem;"
        />
        <br />
        Theme
      </div>
    </Link>
  </div>
</nav>

<style>
  main {
    font-family: "Rubik", sans-serif;
  }

  .pure-g [class*="pure-u"] {
    font-family: "Rubik", sans-serif;
  }
  .navbar {
    background-color: #18181b;
    height: 100vh;
    border-right: 2px solid #6441a4;
    box-sizing: border-box;
  }
</style>
