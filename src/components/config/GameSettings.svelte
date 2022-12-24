<script lang="ts">
  import { flip } from "svelte/animate";
  import {
    ConfigData,
    ConfigService,
    GameData,
    LocalConfigService,
    TwitchConfigService,
  } from "@lib/config";
  import {
    getUsersPersonalBests,
    lookupUserByName,
    PersonalBest,
  } from "@lib/src-api";
  import { onMount } from "svelte";
  import SpinnerRow from "@components/common/SpinnerRow.svelte";
  import structuredClone from '@ungap/structured-clone';

  let configService: ConfigService;

  // State
  let srcName = "";
  let srcId = undefined;

  let liveData: Map<string, PersonalBest> = undefined;
  let configData = new ConfigData();
  let originalConfigData = undefined;

  let loadingUserData = true;
  let loadingGameData = true;

  $: changesToSave = originalConfigData !== undefined && JSON.stringify(configData) !== JSON.stringify(originalConfigData);

  onMount(async () => {
    // Get the user's configuration
    if (
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost"
    ) {
      console.log("using local host config");
      configService = new LocalConfigService();
      configReady();
    } else if (window.Twitch && window.Twitch.ext) {
      // Twitch's extension helper makes heavy use of the window object
      // so this is a little clunky to work with unfortunately
      console.log("on twitch!");
      configService = new TwitchConfigService(window);
      // Setup Twitch callbacks
      window.Twitch.ext.configuration.onChanged(() => {
        configReady();
      });
      window.Twitch.ext.onAuthorized((auth) => {
        console.log("authed!");
        // there isn't much to do here because we aren't using our own EBS anymore
        // TODO - mark component as ready
      });
      // TODO - register `onContext` to react to things like theme changes
    } else {
      console.log("unable to determine the config source");
    }
  });

  const configReady = async () => {
    console.log("config ready");
    if (configService.broadcasterConfigExists()) {
      console.log("using existing broadcaster config");
      configData = configService.getBroadcasterConfig();
      originalConfigData = structuredClone(configData);
      loadingUserData = false;
      srcName = configData.gameData.userSrcName;
      srcId = configData.gameData.userSrcId;
      loadingGameData = true;
      liveData = await getUsersPersonalBests(srcId);
      loadingGameData = false;
    } else {
      console.log("could not find existing broadcaster config");
      loadingUserData = false;
      loadingGameData = false;
    }
  };

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
    // TODO - refresh a particular game?
    loadingGameData = true;
    // Get the live data from speedrun.com, this can be joined via the id
    // to the saved settings data
    liveData = await getUsersPersonalBests(srcId);
    // TODO - merge new stuff in if they already have something saved
    configData.gameData = GameData.initFromPersonalBestData(liveData);
    configData.gameData.userSrcId = srcId;
    configData.gameData.userSrcName = srcName;
    loadingGameData = false;
  }

  async function saveSettings() {
    configService.setBroadcasterConfig(configData);
    notify(`Settings Saved Successfully!`, "success", "check2-circle", 3000);
    originalConfigData = structuredClone(configData);
  }

  async function revertChanges() {
    configData = structuredClone(originalConfigData);
  }

  let hoveringGameEntry = undefined;

  function dropGameEntry(event, gameIdx, targetIndex) {
    event.dataTransfer.dropEffect = "move";
    const originIndex = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = configData.gameData.games[gameIdx].entries;

    if (originIndex < targetIndex) {
      newTracklist.splice(targetIndex + 1, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex, 1);
    } else {
      newTracklist.splice(targetIndex, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex + 1, 1);
    }
    configData.gameData.games[gameIdx].entries = newTracklist;
    hoveringGameEntry = null;
  }

  function dragstartGameEntry(event, i) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", i);
  }

  let hoveringGame = undefined;

  function dropGame(event, gameIdx) {
    event.dataTransfer.dropEffect = "move";
    const originIndex = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = configData.gameData.games;

    if (originIndex < gameIdx) {
      newTracklist.splice(gameIdx + 1, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex, 1);
    } else {
      newTracklist.splice(gameIdx, 0, newTracklist[originIndex]);
      newTracklist.splice(originIndex + 1, 1);
    }
    configData.gameData.games = newTracklist;
    hoveringGameEntry = null;
  }

  function dragstartGame(event, i) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("text/plain", i);
  }

  // Setting Change Handlers
  async function disableGame(val: boolean, gameIdx: number) {
    if (configData.gameData.games[gameIdx].isDisabled == val) {
      return;
    }
    configData.gameData.games[gameIdx].isDisabled = val;
    console.log(configData);
    console.log(originalConfigData);
  }

  async function disableGameEntry(
    val: boolean,
    gameIdx: number,
    entryIdx: number
  ) {
    if (
      configData.gameData.games[gameIdx].entries[entryIdx].isDisabled == val
    ) {
      return;
    }
    configData.gameData.games[gameIdx].entries[entryIdx].isDisabled = val;
  }

  async function overrideGameDefaults(val: boolean, gameIdx: number) {
    if (configData.gameData.games[gameIdx].overrideDefaults == val) {
      return;
    }
    configData.gameData.games[gameIdx].overrideDefaults = val;
  }

  async function overrideGameEntryDefaults(
    val: boolean,
    gameIdx: number,
    entryIdx: number
  ) {
    if (
      configData.gameData.games[gameIdx].entries[entryIdx].overrideDefaults ==
      val
    ) {
      return;
    }
    configData.gameData.games[gameIdx].entries[entryIdx].overrideDefaults = val;
  }

  async function setGameEntryTitleOverride(
    val: string,
    gameIdx: number,
    entryIdx: number
  ) {
    configData.gameData.games[gameIdx].entries[entryIdx].titleOverride = val;
  }

  // Always escape HTML for text arguments!
  function escapeHtml(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  // Custom function to emit toast notifications
  function notify(
    message,
    variant = "primary",
    icon = "info-circle",
    duration = 3000
  ) {
    const alert = Object.assign(document.createElement("sl-alert"), {
      variant,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${escapeHtml(message)}
      `,
    });

    document.body.append(alert);
    return alert.toast();
  }
</script>

{#if loadingUserData}
  <SpinnerRow loadingMessage="Loading User Data" />
{:else}
  <div class="row">
    <div class="col-6">
      <sl-input
        label="Speedrun.com Username"
        help-text="Enter your Speedrun.com username to search for personal bests!"
        value={srcName}
        on:sl-input={srcNameChanged}>{srcName}</sl-input
      >
    </div>
  </div>
  <div class="row">
    <div class="col" id="setting-controls">
      <sl-button
        variant="primary"
        on:click={refreshGameList}
        disabled={srcName === undefined || srcName === ""}
        >Refresh Games</sl-button
      >
      <sl-button variant="warning" disabled={!changesToSave} on:click={revertChanges}
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
  <h2>Game List <em class="normal-text">Drag to order</em></h2>
  {#if configData.gameData.games.length > 0}
    <div class="list">
      {#each configData.gameData.games as game, gameIdx (gameIdx)}
        <div
          class="list-item"
          draggable="true"
          animate:flip
          on:dragstart={(event) => dragstartGame(event, gameIdx)}
          on:drop|preventDefault={(event) => dropGame(event, gameIdx)}
          on:dragenter={() => (hoveringGame = gameIdx)}
          on:dragover|preventDefault
          class:is-active={hoveringGame === gameIdx}
        >
          {game.title}
        </div>
      {/each}
    </div>
  {/if}
  <h2>Game Options</h2>
  <div id="game-list">
    {#each configData.gameData.games as game, gameIdx (gameIdx)}
      <sl-details class="game-pane">
        <div slot="summary" class="game-header">
          <div class="row">
            <div class="col">
              <h3>{game.title}</h3>
            </div>
          </div>
          <div class="row">
            <div class="col">
              {#if game.isDisabled}
                <sl-badge variant="danger" pill>Disabled</sl-badge>
              {:else}
                <sl-badge variant="success" pill>Enabled</sl-badge>
              {/if}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <sl-switch
              checked={game.isDisabled}
              on:sl-change={(event) =>
                disableGame(event.target.checked, gameIdx)}
              >Disable Game</sl-switch
            >
          </div>
          <div class="col">
            <sl-switch
              checked={game.overrideDefaults}
              on:sl-change={(event) =>
                overrideGameDefaults(event.target.checked, gameIdx)}
              >Override Defaults</sl-switch
            >
          </div>
        </div>
        {#if game.overrideDefaults}
          <div class="row">
            <div class="col">
              <sl-switch checked={game.showSeconds}>Show Seconds</sl-switch>
            </div>
            <div class="col">
              <sl-switch checked={game.showMilliseconds}
                >Show Milliseconds</sl-switch
              >
            </div>
          </div>
        {/if}
        {#if game.overrideDefaults}
          <div class="row">
            <div class="col">
              <sl-input label="Game Title Override" value={game.title} />
            </div>
          </div>
        {/if}
        <h4 class="entry-heading">
          Entries <em class="normal-text">Drag to order</em>
        </h4>
        <div class="row">
          {#each game.entries as entry, entryIdx (`${game.srcId}-${entryIdx}`)}
            <div
              class="col-4"
              draggable="true"
              on:dragstart={(event) => dragstartGameEntry(event, entryIdx)}
              on:drop|preventDefault={(event) =>
                dropGameEntry(event, gameIdx, entryIdx)}
              on:dragenter={() => (hoveringGameEntry = entryIdx)}
              on:dragover|preventDefault
              class:is-active={hoveringGameEntry === entryIdx}
            >
              <sl-card class="game-entry">
                <div slot="header">
                  {liveData.get(entry.dataId).getCategoryOrLevelName()}
                  {#if liveData.get(entry.dataId).isLevel || liveData.get(entry.dataId).hasSubcategories || liveData.get(entry.dataId).srcIsMiscCategory}
                    <br />
                    <div class="entry-types">
                      {#if configData.gameData.games[gameIdx].entries[entryIdx].isDisabled}
                        <sl-badge variant="danger" pill>Disabled</sl-badge>
                      {/if}
                      {#if liveData.get(entry.dataId).isLevel}
                        <sl-badge variant="primary" pill>Level</sl-badge>
                      {/if}
                      {#if liveData.get(entry.dataId).hasSubcategories}
                        <sl-badge variant="warning" pill>Subcategories</sl-badge
                        >
                      {/if}
                      {#if liveData.get(entry.dataId).srcIsMiscCategory}
                        <sl-badge variant="neutral" pill>Misc</sl-badge>
                      {/if}
                    </div>
                  {/if}
                </div>
                <div class="row">
                  <div class="col-6">
                    <sl-switch
                      on:sl-change={(event) =>
                        disableGameEntry(
                          event.target.checked,
                          gameIdx,
                          entryIdx
                        )}>Disable Entry</sl-switch
                    >
                  </div>
                  <div class="col-6">
                    <sl-switch
                      checked={entry.overrideDefaults}
                      on:sl-change={(event) =>
                        overrideGameEntryDefaults(
                          event.target.checked,
                          gameIdx,
                          entryIdx
                        )}>Override Defaults</sl-switch
                    >
                  </div>
                </div>
                {#if entry.overrideDefaults}
                  <sl-input
                    class="mt-1"
                    label="Title Override"
                    value={entry.titleOverride}
                    on:sl-input={(event) => setGameEntryTitleOverride(event.target.value, gameIdx, entryIdx)}
                  />
                {/if}
              </sl-card>
            </div>
          {/each}
        </div>
      </sl-details>
    {/each}
  </div>
{/if}

<style>
  .normal-text {
    font-size: 1rem;
    font-weight: 400;
  }

  em {
    color: var(--sl-input-help-text-color);
  }

  .list {
    margin-bottom: 1em;
    width: auto;
    display: inline-flex;
    flex-direction: column;
    border: 2px #6441a4 solid;
    border-radius: 5px;
  }

  .list-item {
    padding: 0.5em;
    cursor: move;
  }

  .list-item:hover {
    margin-left: 1em;
  }

  .list-item:nth-child(even) {
    background-color: rgb(24, 24, 27);
  }

  .game-entry {
    width: 100%;
    height: 100%;
    padding: 0.5em;
    cursor: move;
  }

  .game-entry:hover {
    border: 1px solid #6441a4;
    border-radius: 5px;
  }

  .entry-heading {
    margin-bottom: 1em;
  }

  .game-entry::part(base) {
    height: 100%;
  }

  .game-entry .entry-types {
    margin-top: 0.5em;
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
