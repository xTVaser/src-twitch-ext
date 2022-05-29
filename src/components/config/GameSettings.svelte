<script lang="ts">
  import { flip } from "svelte/animate";
  import { ConfigData, GameData, LocalConfigService } from "@src/lib/config";
  import {
    getUsersPersonalBests,
    lookupUserByName,
    PersonalBest,
  } from "@src/lib/src-api";
  import { onMount } from "svelte";
  import SpinnerRow from "@components/common/SpinnerRow.svelte";

  let configService = new LocalConfigService();

  // State
  let srcName = "";
  let srcId = undefined;

  let liveData: Map<string, PersonalBest> = undefined;
  let configData = new ConfigData();

  let loadingUserData = false;
  let loadingGameData = false;

  let changesToSave = false;

  onMount(async () => {
    // Get the user's configuration
    loadingUserData = true;
    let data = configService.getBroadcasterConfig();
    if (data === undefined) {
      loadingUserData = false;
      return;
    }
    configData = data;
    loadingUserData = false;
    // Else, initialize the state
    srcName = configData.gameData.userSrcName;
    srcId = configData.gameData.userSrcId;
    loadingGameData = true;
    liveData = await getUsersPersonalBests(srcId);
    loadingGameData = false;
  });

  const srcNameChanged = (event) => {
    srcName = event.target.value.trim();
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

    // TODO - need a reset to defaults button in places (maybe)
    loadingGameData = true;
    // Get the live data from speedrun.com, this can be joined via the id
    // to the saved settings data
    liveData = await getUsersPersonalBests(srcId);
    // TODO - merge new stuff in if they already have something saved
    configData.gameData = GameData.initFromPersonalBestData(liveData);
    configData.gameData.userSrcId = srcId;
    configData.gameData.userSrcName = srcName;
    loadingGameData = false;

    // TEMP
    changesToSave = true;
  }

  async function saveSettings() {
    configService.setBroadcasterConfig(configData);
    notify(`Settings Saved Successfully!`, "success", "check2-circle", 3000);
  }

  let hovering = undefined;

  const drop = (event, pbCollIndex, targetIndex) => {
    event.dataTransfer.dropEffect = "move";
    const originIndex = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = configData.gameData.games[pbCollIndex].entries;

    if (originIndex < targetIndex) {
      newTracklist.splice(targetIndex + 1, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex, 1);
    } else {
      newTracklist.splice(targetIndex, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex + 1, 1);
    }
    configData.gameData.games[pbCollIndex].entries = newTracklist;
    hovering = null;
  };

  const dragstart = (event, i) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", i);
  };

  // Setting Change Handlers
  async function disableGame(val: boolean, gameIdx : number) {
    if (configData.gameData.games[gameIdx].isDisabled == val) {
      return;
    }
    configData.gameData.games[gameIdx].isDisabled = val;
    changesToSave = true;
  }

  async function overrideGameDefaults(val: boolean, gameIdx : number) {
    if (configData.gameData.games[gameIdx].overrideDefaults == val) {
      return;
    }
    configData.gameData.games[gameIdx].overrideDefaults = val;
    changesToSave = true;
  }

  async function overrideGameEntryDefaults(val: boolean, gameIdx : number, entryIdx : number) {
    if (configData.gameData.games[gameIdx].entries[entryIdx].overrideDefaults == val) {
      return;
    }
    configData.gameData.games[gameIdx].entries[entryIdx].overrideDefaults = val;
    changesToSave = true;
  }

  // Always escape HTML for text arguments!
  function escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Custom function to emit toast notifications
  function notify(message, variant = 'primary', icon = 'info-circle', duration = 3000) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${escapeHtml(message)}
      `
    });

    document.body.append(alert);
    return alert.toast();
  }
</script>

<div class="container">
  {#if loadingUserData}
    <SpinnerRow loadingMessage="Loading User Data" />
  {:else}
    <div class="pure-g center-row">
      <div class="pure-u-1-2">
        <sl-input
          label="Speedrun.com Username"
          help-text="Enter your Speedrun.com username to search for personal bests!"
          value={srcName}
          on:sl-input={srcNameChanged}>{srcName}</sl-input
        >
      </div>
      <div class="pure-u-1-2">
        <sl-button
          class="ml-2"
          variant="primary"
          on:click={refreshGameList}
          disabled={srcName === undefined || srcName === ""}
          >Refresh Games</sl-button
        >
      </div>
    </div>
    <div class="pure-g mt-2">
      <div class="pure-u" id="setting-controls">
        <sl-button variant="warning" disabled={!changesToSave}
          >Revert Changes</sl-button
        >
        <sl-button
          variant="success"
          disabled={!changesToSave}
          on:click={saveSettings}>Save Changes</sl-button
        >
      </div>
    </div>
  {/if}
  {#if loadingGameData}
    <SpinnerRow loadingMessage="Loading Game Data" />
  {:else}
    <h2>Default Game Settings</h2>
    <div class="pure-g">
      <div class="pure-u-1-4">
        <sl-switch checked={configData.gameData.general.showSeconds}>Show Seconds</sl-switch>
      </div>
      <div class="pure-u-1-4">
        <sl-switch checked={configData.gameData.general.showMilliseconds}>Show Milliseconds</sl-switch>
      </div>
    </div>
    <h2>Game List</h2>
    <!-- TODO - allowing changing order of games -->
    <div id="game-list">
      {#each configData.gameData.games as game, gameIdx (gameIdx)}
        <sl-details class="game-pane">
          <div slot="summary" class="game-header">
            <div class="pure-g">
              <div class="pure-u">
                <h3>{game.title}</h3>
              </div>
              <div class="pure-u">
                {#if game.isDisabled}
                <sl-badge variant="danger" pill>Disabled</sl-badge>
                {:else}
                <sl-badge variant="success" pill>Enabled</sl-badge>
                {/if}
              </div>
            </div>
          </div>
          <div class="pure-g">
            <div class="pure-u-1-4">
              <sl-switch checked={game.isDisabled} on:sl-change={event => disableGame(event.target.checked, gameIdx)}>Disable Game</sl-switch>
            </div>
            <div class="pure-u-1-4">
              <sl-switch checked={game.overrideDefaults} on:sl-change={event => overrideGameDefaults(event.target.checked, gameIdx)}>Override Defaults</sl-switch>
            </div>
            {#if game.overrideDefaults}
            <div class="pure-u-1-4">
              <sl-switch checked={game.showSeconds}>Show Seconds</sl-switch>
            </div>
            <div class="pure-u-1-4">
              <sl-switch checked={game.showMilliseconds}>Show Milliseconds</sl-switch>
            </div>
            {/if}
          </div>
          {#if game.overrideDefaults}
          <div class="pure-g mt-1">
            <div class="pure-u-1">
              <sl-input label="Game Title Override" value={game.title} />
            </div>
          </div>
          {/if}
          <h4 class="entry-heading">Entries (Drag to Reorder)</h4>
          <div class="pure-g">
            {#each game.entries as entry, entryIdx (`${game.srcId}-${entryIdx}`)}
              <div
                class="pure-u-1-3"
                draggable="true"
                animate:flip
                on:dragstart={(event) => dragstart(event, entryIdx)}
                on:drop|preventDefault={(event) =>
                  drop(event, gameIdx, entryIdx)}
                on:dragenter={() => (hovering = entryIdx)}
                on:dragover|preventDefault
                class:is-active={hovering === entryIdx}
              >
                <sl-card class="game-entry">
                  <div slot="header">
                    {liveData.get(entry.dataId).getCategoryOrLevelName()}
                    {#if liveData.get(entry.dataId).isLevel}
                    <sl-badge variant="success" pill>Level</sl-badge>
                    {/if}
                    {#if liveData.get(entry.dataId).hasSubcategories}
                    <sl-badge variant="warning" pill>Subcategories</sl-badge>
                    {/if}
                    {#if liveData.get(entry.dataId).srcIsMiscCategory}
                    <sl-badge variant="neutral" pill>Misc</sl-badge>
                    {/if}
                  </div>
                  <div class="pure-g">
                    <div class="pure-u-1-2">
                      <sl-switch>Disable Entry</sl-switch>
                    </div>
                    <div class="pure-u-1-2">
                      <sl-switch on:sl-change={event => overrideGameEntryDefaults(event.target.checked, gameIdx, entryIdx)}>Override Defaults</sl-switch>
                    </div>
                  </div>
                  {#if entry.overrideDefaults}
                  <sl-input class="mt-1" label="Title Override" value="" />
                  {/if}
                </sl-card>
              </div>
            {/each}
          </div>
        </sl-details>
      {/each}
    </div>
  {/if}
</div>

<style>
  .game-entry {
    width: 100%;
    height: 100%;
    padding: 0.5em;
  }

  .entry-heading {
    margin-bottom: 1em;
  }

  .game-entry::part(base) {
    height: 100%;
  }

  .center-row {
    align-items: center;
  }

  .ml-2 {
    margin-left: 2em;
  }

  .mt-1 {
    margin-top: 1em;
  }

  .mt-2 {
    margin-top: 2em;
  }

  #setting-controls sl-button:not(:last-child) {
    margin-right: 1em;
  }

  .game-header {
    width: 100%;
  }

  .game-header h3 {
    margin: 0;
    margin-right: 1em;
  }

  #game-list .game-pane:not(:last-child) {
    margin-bottom: 0.5em;
  }
</style>
