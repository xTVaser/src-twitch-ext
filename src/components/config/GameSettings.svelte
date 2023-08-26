<script lang="ts">
  import {
    getUsersGamesFromPersonalBests,
    lookupUserByName,
    type UserGameData,
  } from "@lib/src-api";
  import { onMount } from "svelte";
  import structuredClone from "@ungap/structured-clone";
  import { configStore } from "@lib/stores/config";
  import { notify } from "@lib/toast";
  import "@shoelace-style/shoelace/dist/components/input/input.js";
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
  import "@shoelace-style/shoelace/dist/components/radio/radio.js";
  import "@shoelace-style/shoelace/dist/components/radio-group/radio-group.js";
  import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
  import { log } from "@lib/logging";

  $: cfg = $configStore;

  // State
  let srcName: string = "";
  let srcId: string | null = null;

  let userGames: UserGameData[] | undefined = undefined;
  let speedrunComError = false;
  let originalConfigData = undefined;

  let loadingConfigData = true;
  let loadingGameData = false;
  let resetMalformedConfig = false;

  onMount(async () => {
    configStore.subscribe(async () => {
      if (cfg.loaded) {
        if (cfg.service.broadcasterConfigExists()) {
          console.log(cfg);
          originalConfigData = structuredClone(cfg.config);
          if (cfg.config.gameData.userSrcName === null) {
            srcName = "";
          } else {
            srcName = cfg.config.gameData.userSrcName;
          }
          srcId = cfg.config.gameData.userSrcId;
          if (srcName !== null && srcName !== "") {
            loadingGameData = true;
            speedrunComError = false;
            const response = await getUsersGamesFromPersonalBests(srcId);
            if ("errorMessage" in response) {
              notify(
                "Unable to retrieve data from Speedrun.com",
                "danger",
                "exclamation-octagon",
                3000,
              );
              speedrunComError = true;
              userGames = undefined;
            } else {
              userGames = response;
            }
            loadingGameData = false;
          }
        }
        loadingConfigData = false;
      }
    });
  });

  function areChangesPending(current, original) {
    return (
      (original === undefined && current !== undefined) ||
      (original !== undefined &&
        JSON.stringify(current) !== JSON.stringify(original))
    );
  }

  const srcNameChanged = (event) => {
    srcName = event.target.value.trim();
  };

  async function refreshGameList() {
    log(`Searching with ${srcName}:${srcId}`);
    if (srcName === null || srcName === "") {
      notify("Please enter a username", "danger", "exclamation-octagon", 3000);
      return;
    }
    // If we don't have their ID yet, go get it
    // or if the name has changed, look it up again
    if (
      srcId === null ||
      (cfg.config.gameData.userSrcName !== null &&
        srcName != cfg.config.gameData.userSrcName)
    ) {
      log(`Looking up ${srcName}`);
      try {
        const lookupResponse = await lookupUserByName(srcName);
        if ("errorMessage" in lookupResponse) {
          notify(
            lookupResponse.errorMessage,
            "danger",
            "exclamation-octagon",
            3000,
          );
          return;
        }
        srcId = lookupResponse.id;
      } catch (error) {
        notify(
          "Unexpected error occurred during user lookup",
          "danger",
          "exclamation-octagon",
          3000,
        );
        return;
      }
    }
    loadingGameData = true;
    speedrunComError = false;
    const response = await getUsersGamesFromPersonalBests(srcId);
    if ("errorMessage" in response) {
      notify(
        "Unable to retrieve data from Speedrun.com",
        "danger",
        "exclamation-octagon",
        3000,
      );
      speedrunComError = true;
      userGames = undefined;
    } else {
      // Remove any games that were previously disabled that no longer have runs for them.
      let cleanedDisabledGameIds = [];
      for (const disabledGameId of cfg.config.gameData.disabledGames) {
        if (response.find((game) => game.id === disabledGameId) !== undefined) {
          cleanedDisabledGameIds.push(disabledGameId);
        }
      }
      cfg.config.gameData.disabledGames = cleanedDisabledGameIds;
      userGames = response;
      cfg.config.gameData.userSrcId = srcId;
      cfg.config.gameData.userSrcName = srcName;
    }
    loadingGameData = false;
  }

  async function saveSettings() {
    cfg.service.setBroadcasterConfig(cfg.config);
    notify(`Settings Saved Successfully!`, "success", "check2-circle", 3000);
    log(cfg.config);
    originalConfigData = structuredClone(cfg.config);
    resetMalformedConfig = false;
  }

  async function revertChanges() {
    cfg.config = structuredClone(originalConfigData);
  }

  // Setting Change Handlers
  async function disableGame(val: boolean, gameId: string) {
    // Check to see if the game is already disabled
    const gameIdx = cfg.config.gameData.disabledGames.findIndex(
      (disabledGameId) => disabledGameId === gameId,
    );
    if (gameIdx === -1) {
      // If we are trying to enable it, do nothing it's already enabled
      if (val) {
        return;
      }
      // otherwise, add it to the list
      cfg.config.gameData.disabledGames.push(gameId);
      cfg.config = cfg.config;
      return;
    }
    // If we found it, then we either need to remove it from the list or leave it alone
    if (!val) {
      return;
    }
    cfg.config.gameData.disabledGames.splice(gameIdx, 1);
    cfg.config = cfg.config;
  }

  async function resetConfiguration() {
    resetMalformedConfig = true;
    configStore.resetConfig();
    originalConfigData = structuredClone(cfg.config);
  }
</script>

{#if loadingConfigData}
  <div class="spinner-container" data-cy="panel-loading-spinner">
    <sl-spinner class="loading-spinner"></sl-spinner>
    <h3>Loading Config...</h3>
  </div>
{:else if cfg.loaded && cfg.configInvalid}
  <div class="spinner-container" data-cy="panel-bad-config-prompt">
    <h3>Config is malformed, it needs to be reset</h3>
    <sl-button
      variant="warning"
      on:click={resetConfiguration}
      data-cy="config_games_config-reset-btn">Reset Configration</sl-button
    >
  </div>
{:else if cfg.loaded && cfg.configError !== undefined}
  <div class="spinner-container" data-cy="panel-config-outage-prompt">
    <h3>
      Unable to load configuration, Twitch's configuration service may be down
    </h3>
  </div>
{:else}
  <div class="row" data-cy="config_games_src-username-form">
    <div class="col-6">
      <sl-input
        data-cy="config_games_src-username-input"
        label="Speedrun.com Username"
        help-text="Enter your Speedrun.com username to search for personal bests!"
        value={srcName}
        on:sl-input={srcNameChanged}>{srcName}</sl-input
      >
    </div>
  </div>
  <div class="row mt-1" data-cy="config_games_controls">
    <div class="col" id="setting-controls">
      <sl-button
        data-cy="config_games_refresh-btn"
        variant="primary"
        on:click={refreshGameList}
        disabled={srcName === "" || srcName === null || loadingGameData}
        >Refresh Games</sl-button
      >
      <sl-button
        data-cy="config_games_revert-btn"
        variant="warning"
        disabled={!areChangesPending(cfg.config, originalConfigData) ||
          originalConfigData === undefined ||
          resetMalformedConfig}
        on:click={revertChanges}>Revert Changes</sl-button
      >
      <sl-button
        data-cy="config_games_save-btn"
        variant="success"
        disabled={!areChangesPending(cfg.config, originalConfigData) ||
          (originalConfigData === undefined && srcId === null)}
        on:click={saveSettings}>Save Changes</sl-button
      >
    </div>
  </div>
{/if}
{#if loadingGameData}
  <div class="spinner-container" data-cy="panel-loading-spinner">
    <sl-spinner class="loading-spinner"></sl-spinner>
    <h3>Loading Game Data...</h3>
  </div>
{:else if speedrunComError}
  <p class="mt-1" data-cy="config_games_speedruncom-error">
    Unable to retrieve data from Speedrun.com's API. This may be a temporary
    issue or a bug in the extension, however the main API endpoint for this has
    known performance issues if you have a ton of personal bests - <a
      href="https://github.com/speedruncomorg/api/issues/170"
      target="_blank"
      rel="noopener noreferrer"
      >https://github.com/speedruncomorg/api/issues/170</a
    >
  </p>
{:else if cfg.loaded && !cfg.configInvalid && userGames !== undefined}
  {#if userGames.length <= 0}
    <h2>No Games Found</h2>
  {:else}
    <h2 class="mt-1">Options</h2>
    <sl-radio-group
      label="Game Ordering"
      value={cfg.config.gameData.gameSorting}
      on:sl-change={(event) => {
        cfg.config.gameData.gameSorting = event.target.value;
      }}
    >
      <sl-radio value="recent" data-cy="config_games_game-sorting-recent"
        >By most recent run date</sl-radio
      >
      <sl-radio value="num" data-cy="config_games_game-sorting-num"
        >Number of runs</sl-radio
      >
      <sl-radio value="alpha" data-cy="config_games_game-sorting-alpha"
        >Alphabetically by name</sl-radio
      >
    </sl-radio-group>
    <sl-radio-group
      label="Run Ordering"
      value={cfg.config.gameData.entrySorting}
      class="mt-1"
      on:sl-change={(event) => {
        cfg.config.gameData.entrySorting = event.target.value;
      }}
    >
      <sl-radio value="recent" data-cy="config_games_entry-sorting-recent"
        >By date</sl-radio
      >
      <sl-radio value="alpha" data-cy="config_games_entry-sorting-alpha"
        >Alphabetically by category</sl-radio
      >
      <sl-radio value="place" data-cy="config_games_entry-sorting-place"
        >Leaderboard position</sl-radio
      >
    </sl-radio-group>
    <sl-checkbox
      checked={cfg.config.gameData.groupLevelsSeparately}
      on:sl-change={(event) => {
        cfg.config.gameData.groupLevelsSeparately = event.target.checked;
      }}
      data-cy="config_games_group-levels-separately"
    >
      Group level runs separately
    </sl-checkbox>
    <h2 class="mt-1">Game List</h2>
    <div id="game-list">
      {#each userGames as userGame}
        <div class="row">
          <div class="col">
            <sl-checkbox
              data-cy="config_games_game-checkbox"
              checked={!cfg.config.gameData.disabledGames.find(
                (disabledGameId) => disabledGameId === userGame.id,
              )}
              on:sl-change={(event) => {
                disableGame(event.target.checked, userGame.id);
              }}>{userGame.name}</sl-checkbox
            >
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .spinner-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
  }

  .spinner-container h3 {
    font-size: 1em;
    color: white;
  }

  .loading-spinner {
    font-size: 3rem;
    --track-width: 5px;
    --indicator-color: cyan;
  }

  .mt-1 {
    margin-top: 1em;
  }

  #setting-controls sl-button:not(:last-child) {
    margin-right: 1em;
  }
</style>
