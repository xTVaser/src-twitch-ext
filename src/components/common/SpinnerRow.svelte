<script lang="ts">
  export let loadingMessage = undefined;
</script>

<div class="mt-1">
  <div class="row spinner-row">
    <sl-spinner style="font-size: 3rem;" />
  </div>
  {#if loadingMessage}
    <div class="row spinner-row mt-1">
      {loadingMessage}
    </div>
  {/if}
</div>

<style>
  .mt-1 {
    margin-top: 1em;
  }

  .spinner-row {
    justify-content: center;
  }
</style>
