<script lang="ts">
  import { flip } from "svelte/animate";
  import Navbar from "@components/config/Navbar.svelte";
  import {
    lookupUserByName,
    getUsersPersonalBests,
    PersonalBestCollection,
  } from "@src/lib/src-api";
import { ConfigData, GameData, LocalConfigService } from "@src/lib/config";

  let configService = new LocalConfigService();
  let srcName = undefined;
  let srcId = undefined;
  let configData = new ConfigData();

  let loadingData = false;

  const srcNameChanged = (event) => {
    srcName = event.target.value;
  };

  async function refreshGameList() {
    if (srcName === undefined) {
      // TODO - error
      return;
    }
    // If we don't have their ID yet, go get it
    if (srcId === undefined) {
      try {
        srcId = (await lookupUserByName(srcName)).id;
      } catch (error) {
        // TODO - error
        return;
      }
    }

    loadingData = true;
    let data = await getUsersPersonalBests(srcId);
    configData.gameData = GameData.initFromPersonalBestData(data);
    loadingData = false;
  }

  async function saveSettings() {
    configService.setBroadcasterConfig(configData);
  }

  let hovering = undefined;

  const drop = (event, pbCollIndex, targetIndex) => {
    event.dataTransfer.dropEffect = 'move';
    const originIndex = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = configData.gameData.games[pbCollIndex].entries;

    if (originIndex < targetIndex) {
      newTracklist.splice(targetIndex + 1, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex, 1);
    } else {
      newTracklist.splice(targetIndex, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex + 1, 1);
    }
    configData.gameData.games[pbCollIndex].entries = newTracklist
    hovering = null
  }

  const dragstart = (event, i) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", i);
  };
</script>

<div class="pure-g">
  <Navbar />
  <div class="pure-u-7-8 content scroll-y">
    <div class="container">
      <!-- TODO - Alert section -->
      <div class="pure-g">
        <div class="pure-u-1-2">
          <sl-input
            label="Speedrun.com User Name"
            help-text="Enter your Speedrun.com Username to Search for Personal Bests!"
            value="xtvaser"
            on:sl-input={srcNameChanged}>{srcName}</sl-input
          >
        </div>
      </div>
      <div class="pure-g mt-2">
        <div class="pure-u">
          <sl-button
            variant="primary"
            on:click={refreshGameList}
            disabled={srcName === undefined || srcName === ""}
            >Refresh Games</sl-button
          >
          <sl-button variant="warning" disabled>Revert Changes</sl-button>
          <sl-button variant="success" on:click={saveSettings}>Save Changes</sl-button>
        </div>
      </div>
      {#if loadingData}
        <sl-spinner style="font-size: 3rem;"></sl-spinner>
      {/if}
      <div class="pure-g">
        <div class="pure-u">
          <h2>Default Game Settings</h2>
          <sl-switch>Display WR</sl-switch>
          <sl-switch>Rainbow WR</sl-switch>
          <sl-switch>Hide Milliseconds</sl-switch>
          <sl-switch>Hide Seconds</sl-switch>
        </div>
      </div>
      <div class="mt-2">
        {#each configData.gameData.games as game, collIndex (collIndex)}
          <sl-details>
            <div slot="summary">
              {game.title}
              <sl-badge variant="success" pill>Enabled</sl-badge>
            </div>
            <sl-switch>Disable Game</sl-switch>
            <sl-switch>Override Defaults</sl-switch>
            <sl-switch>Display WR</sl-switch>
            <sl-switch>Rainbow WR</sl-switch>
            <sl-switch>Hide Milliseconds</sl-switch>
            <sl-switch>Hide Seconds</sl-switch>
            <sl-input
              label="Game Title Override"
              value={game.title}
            />
            <sl-input label="Default Category Name Template" value="words" />
            <div class="pure-g">
              {#each game.entries as pb, index (`${game.srcId}-${index}`)}
                <div class="pure-u-1-3"
                  draggable="true"
                  animate:flip
                  on:dragstart={(event) => dragstart(event, index)}
                  on:drop|preventDefault={event => drop(event, collIndex, index)}
                  on:dragenter={() => hovering = index}
                  on:dragover|preventDefault
                  class:is-active={hovering === index}>
                  <sl-card class="card-header">
                    <div slot="header">
                      {#if pb.isLevel}
                        {pb.srcLevelName}
                        <sl-badge variant="success" pill>Level</sl-badge>
                      {:else if pb.hasSubcategories}
                        {pb.srcCategoryName}
                        {#each pb.srcSubcategoryInfo as subcat}
                          - {subcat.srcVariableValueVal}
                        {/each}
                      {:else}
                        {pb.srcCategoryName}
                      {/if}
                      {#if pb.hasSubcategories}
                        <sl-badge variant="warning" pill>Subcategories</sl-badge
                        >
                      {/if}
                      {#if pb.isMisc}
                        <sl-badge variant="neutral" pill>Misc</sl-badge>
                      {/if}
                    </div>
                    <sl-switch>Disable Category/Level</sl-switch>
                    <sl-switch>Override Game Title Template</sl-switch>
                    <sl-input label="Category Name Override" value="TODO" />
                  </sl-card>
                </div>
              {/each}
            </div>
          </sl-details>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  sl-card {
    width: 100%;
    padding: 0.5em;
  }
  .content {
    height: 100vh;
  }
  .scroll-y {
    overflow-y: scroll;
  }
  .mt-2 {
    margin-top: 2em;
  }
</style>
