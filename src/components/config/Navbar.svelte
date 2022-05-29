<script lang="ts">
</script>

<nav class="pure-u-1-12 navbar">
  <div class="pure-g justify-content-center padding-1">
    <div class="pure-u">
      Personal Best<br>Extension
    </div>
  </div>
  <div class="pure-g justify-content-center padding-1">
    <a class="nav-link active" href="#">
      <div class="pure-u">
        <sl-icon-button name="joystick" label="Edit" style="font-size: 2.5rem;"></sl-icon-button>
        <br>
        Games
      </div>
    </a>
  </div>
  <div class="pure-g justify-content-center padding-1">
    <a class="nav-link" href="#">
    <div class="pure-u">
      <sl-icon-button name="palette" label="Edit" style="font-size: 2.5rem;"></sl-icon-button>
      <br>
      Theme
    </div>
  </a>
  </div>
</nav>

<style>
main {
  font-family: 'Rubik', sans-serif;
}

.nav-link.active sl-icon-button::part(base) {
  color: #6441A4;
}

.nav-link.active {
  color: #6441A4;
}

.nav-link sl-icon-button::part(base) {
  color: #e2dbf0;
}

.nav-link sl-icon-button::part(base):hover {
  color: #e2dbf0;
}

.nav-link.active sl-icon-button::part(base):hover  {
  color: #6441A4;
}

.pure-g [class*="pure-u"] {
  font-family: 'Rubik', sans-serif;
}
.navbar {
  background-color: #18181b;
  height: 100vh;
  border-right: 2px solid #6441A4;
  box-sizing: border-box;
}
</style>
