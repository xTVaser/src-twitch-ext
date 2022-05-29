<script lang="ts">
  export let loadingMessage = undefined;
</script>

<div class="pure-g mt-1">
  <div class="pure-u-1 spinner-row">
    <sl-spinner style="font-size: 3rem;" />
  </div>
  {#if loadingMessage}
  <div class="pure-u-1 spinner-row mt-1">
    {loadingMessage}
  </div>
  {/if}
</div>

<style>
  .mt-1 {
    margin-top: 1em;
  }

  .spinner-row {
    display: flex;
    justify-content: center;
  }
</style>
