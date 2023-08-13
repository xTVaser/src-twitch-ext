<script lang="ts">
  import {
    GameDataEntrySettings,
    GameDataGamesSettings,
    getThemeData,
  } from "@lib/config";
  import { getUsersPersonalBests, PersonalBest } from "@lib/src-api";
  import { configStore } from "@lib/stores/config";
  import { onMount } from "svelte";
  import "@shoelace-style/shoelace/dist/components/details/details.js";
  import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";

  $: cfg = $configStore;

  let pbData: Map<string, PersonalBest> | undefined;
  let pbDataLoaded = false;

  onMount(async () => {
    configStore.init(false);
    configStore.subscribe(async () => {
      if (cfg.loaded && cfg.config !== undefined && !pbDataLoaded) {
        // Request SRC for all PBs, not all information is stored in the config settings (times, cover art, etc)
        pbData = await getUsersPersonalBests(cfg.config.gameData.userSrcId);
        // Grab any games and categories not defined in the configuration but the users has done
        // Append them to the end
        if (pbData !== undefined) {
          for (const [dataId, pbInfo] of pbData) {
            // Check if it's a new game or entry
            let isNewGame = true;
            for (let game of cfg.config.gameData.games) {
              if (game.srcId === pbInfo.srcGameId) {
                isNewGame = false;
                // It's the same game, check if the entry exists
                if (
                  game.entries.find((val) => {
                    return val.dataId === dataId;
                  }) === undefined
                ) {
                  console.log(
                    `new dataId - could not find ${dataId} in ${game.entries.map(
                      (val) => val.dataId,
                    )}`,
                  );
                  // It's a new unknown entry in an existing game
                  game.entries.push(new GameDataEntrySettings(dataId));
                }
                break;
              }
            }
            if (isNewGame) {
              // We were unable to find it, it's a new game, add a new game AND the category
              let newGame = new GameDataGamesSettings(
                pbInfo.srcGameId,
                pbInfo.srcGameName,
              );
              newGame.entries.push(new GameDataEntrySettings(dataId));
              cfg.config.gameData.games.push(newGame);
            }
          }
        }

        pbDataLoaded = true;
      }
    });
  });

  function countGameEntries(entries: GameDataEntrySettings[]): number {
    let count = 0;
    for (const entry of entries) {
      if (entry.isDisabled) {
        continue;
      }
      count++;
    }
    return count;
  }

  function liveDataExists(dataId: string): boolean {
    return pbData.has(dataId);
  }

  function getLiveData(dataId: string): PersonalBest {
    return pbData.get(dataId);
  }

  function formatTime(original_seconds: number): string {
    const hours = Math.floor(original_seconds / 3600);
    const minutes = Math.floor((original_seconds % 3600) / 60);
    const seconds = Math.floor(original_seconds % 60);
    let result = "";
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}m `;
    }
    if (seconds > 0) {
      result += `${seconds}s `;
    }
    return result;
  }
</script>

<main data-cy="extension-panel">
  {#if pbDataLoaded && pbData !== undefined}
    {#each cfg.config.gameData.games as game}
      {#if !game.isDisabled && game.entries.length > 0 && liveDataExists(game.entries[0].dataId)}
        <sl-details class="game-pane" data-cy="panel-game">
          <div slot="summary" class="game-header">
            <!-- SRC ISSUE - https://github.com/speedruncomorg/api/issues/169 -->
            <img
              src={getLiveData(game.entries[0].dataId).srcGameCoverUrl.replace(
                "gameasset/",
                "static/game/",
              )}
              alt="Cover art for {game.title}"
              class="game-cover"
              data-cy="panel-game-cover"
            />
            <div class="game-header-text-wrapper">
              <!-- TODO - ellipsis not rendering properly -->
              <span
                class="game-name"
                title={game.title}
                data-cy="panel-game-name"
                ><a
                  href={getLiveData(game.entries[0].dataId).srcGameUrl}
                  target="_blank"
                  rel="noopener noreferrer">{game.title}</a
                ></span
              >
              <br />
              <span data-cy="panel-game-count" class="game-entry-count"
                >{countGameEntries(game.entries)} Runs</span
              >
            </div>
          </div>
          <!-- TODO - what if they get a new run (and in a different game) without saving their config -->
          {#each game.entries as entry}
            {#if !entry.isDisabled && liveDataExists(entry.dataId)}
              <div data-cy="panel-game-entry" class="row game-entry">
                <div class="col entry-name">
                  <span
                    ><a
                      href={getLiveData(entry.dataId).srcRunUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {#if getThemeData(cfg.config).showPlace}
                        <span class="entry-place"
                          >[{getLiveData(entry.dataId)
                            .srcLeaderboardPlace}]</span
                        >
                      {/if}
                      {#if entry.titleOverride !== ""}
                        {entry.titleOverride}
                      {:else}
                        {getLiveData(entry.dataId).getCategoryOrLevelName()}
                      {/if}
                    </a></span
                  >
                </div>
                <div
                  class="entry-time"
                  class:rainbow-cycle={getThemeData(cfg.config)
                    .showRainbowWorldRecord &&
                    getLiveData(entry.dataId).srcLeaderboardPlace === 1}
                >
                  <span>{formatTime(getLiveData(entry.dataId).srcRunTime)}</span
                  >
                </div>
              </div>
            {/if}
          {/each}
        </sl-details>
      {/if}
    {/each}
  {:else if pbDataLoaded && pbData === undefined}
    <div class="spinner-container" data-cy="panel-speedruncom-outage">
      <h3>Unable to retrieve data from Speedrun.com</h3>
    </div>
  {:else if cfg.loaded && cfg.config === undefined}
    <div class="spinner-container" data-cy="panel-nothing-to-load">
      <h3>No Configuration Found</h3>
    </div>
  {:else}
    <div class="spinner-container" data-cy="panel-loading-spinner">
      <sl-spinner class="loading-spinner"></sl-spinner>
      <h3>Loading...</h3>
    </div>
  {/if}
</main>

<style>
  .spinner-container {
    height: 100%;
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
    font-size: 5rem;
    --track-width: 5px;
    --indicator-color: cyan;
  }

  @keyframes rainbow-cycle {
    0%,
    100% {
      color: #ff0000;
    } /* Red */
    14.29% {
      color: #ffa500;
    } /* Orange */
    28.57% {
      color: #ffff00;
    } /* Yellow */
    42.86% {
      color: #00ff00;
    } /* Green */
    57.14% {
      color: #00e1ff;
    } /* Blue */
    71.43% {
      color: #4b0082;
    } /* Indigo */
    85.71% {
      color: #ee82ee;
    } /* Violet */
  }

  main {
    font-family: "Rubik", sans-serif;
    height: 500px; /* TODO - Twitch says 496px */
    width: 318px;
    background-color: var(--src-twitch-ext-color-mainBackground);
    overflow-y: auto;
  }

  .game-cover {
    width: 50px;
    height: 50px;
    object-fit: cover;
    object-position: top;
    flex-shrink: 0;
  }

  .game-header {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .game-header-text-wrapper {
    flex-grow: 1;
    width: 225px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .game-name {
    font-size: 12pt;
    font-weight: var(--src-twitch-ext-font-weight-gameName);
    font-style: var(--src-twitch-ext-font-style-gameName);
    font-family: var(--src-twitch-ext-font-family-gameName), sans-serif;
    color: var(--src-twitch-ext-font-color-gameName);
    margin-left: 10px;
  }

  .game-name a {
    text-decoration: none;
    color: var(--src-twitch-ext-font-color-gameName);
  }

  .game-name a:hover {
    color: var(--src-twitch-ext-color-gameNameLinkHover);
  }

  .game-entry-count {
    margin-left: 10px;
    color: var(--src-twitch-ext-font-color-gameNameSubheader);
    font-family: var(--src-twitch-ext-font-family-gameNameSubheader), sans-serif;
    font-weight: var(--src-twitch-ext-font-weight-gameNameSubheader);
    font-style: var(--src-twitch-ext-font-style-gameNameSubheader);
    font-size: 10pt;
  }

  .game-entry {
    font-size: 10pt;
    font-weight: var(--src-twitch-ext-font-weight-gameEntry);
    font-style: var(--src-twitch-ext-font-style-gameEntry);
    font-family: var(--src-twitch-ext-font-family-gameEntry), sans-serif;
    color: var(--src-twitch-ext-font-color-gameEntry);
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 8px;
    padding-bottom: 8px;
    margin: 0;
    align-items: center;
  }

  .game-entry:nth-child(odd) {
    background-color: var(--src-twitch-ext-color-gameEntriesAlternateRow);
  }

  .entry-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--src-twitch-ext-font-color-gameEntry);
    margin: 0;
    flex: 1;
  }

  .entry-name a {
    text-decoration: none;
    color: var(--src-twitch-ext-font-color-gameEntry);
  }

  .entry-name a:hover {
    color: var(--src-twitch-ext-color-gameEntryLinkHover);
  }

  .entry-place {
    /* TODO make it customizable */
    color: grey;
  }

  .entry-time {
    font-size: 9pt;
    font-family: var(--src-twitch-ext-font-family-gameEntryTime), sans-serif;
    font-weight: var(--src-twitch-ext-font-weight-gameEntryTime);
    font-style: var(--src-twitch-ext-font-style-gameEntryTime);
    color: var(--src-twitch-ext-font-color-gameEntryTime);
    display: flex;
    justify-content: right;
    margin: 0;
    flex-shrink: 0;
    margin-left: 1rem;
  }

  .rainbow-cycle {
    animation: rainbow-cycle 5s linear infinite;
  }

  .game-pane {
    margin-bottom: 0.25em;
  }

  .game-pane::part(base) {
    border-radius: 0;
  }

  .game-pane::part(content) {
    padding: 0;
    border: 0;
  }

  .game-pane::part(header) {
    background-color: var(--src-twitch-ext-color-gameHeaderBackground);
    padding: 10px;
  }

  .game-pane::part(summary) {
    width: 100%;
  }

  .game-pane::part(summary-icon) {
    color: var(--src-twitch-ext-color-gameExpandIcon);
    visibility: var(--src-twitch-ext-gameExpandIconVisibility);
  }

  .game-pane::part(content) {
    background-color: var(--src-twitch-ext-color-gameEntriesBackground);
  }
</style>
