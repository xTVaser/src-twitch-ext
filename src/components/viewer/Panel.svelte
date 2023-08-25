<script lang="ts">
  import { getThemeData } from "@lib/config";
  import { getUsersPersonalBests, PersonalBest } from "@lib/src-api";
  import { configStore } from "@lib/stores/config";
  import { onMount } from "svelte";
  import "@shoelace-style/shoelace/dist/components/details/details.js";
  import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
  import { log } from "@lib/logging";

  $: cfg = $configStore;

  interface GameData {
    gameId: string;
    gameName: string;
    gameUrl: string;
    gameCoverUrl: string | undefined;
    entries: PersonalBest[];
  }

  let pbData: GameData[] | undefined;
  let pbDataLoaded = false;

  onMount(async () => {
    configStore.init(false);
    configStore.subscribe(async () => {
      if (
        cfg.loaded &&
        cfg.config !== undefined &&
        !pbDataLoaded &&
        !cfg.configInvalid &&
        cfg.configError === undefined
      ) {
        // Request SRC for all PBs, not all information is stored in the config settings (times, cover art, etc)
        const response = await getUsersPersonalBests(
          cfg.config.gameData.userSrcId,
        );
        if ("errorMessage" in response) {
          log("error getting personal bests");
          pbDataLoaded = true;
          pbData = undefined;
        } else {
          // Sort runs by gameId, discard the disabled ones
          const sortedGames = new Map<string, GameData>();
          for (const [_, pb] of response) {
            if (cfg.config.gameData.disabledGames.includes(pb.srcGameId)) {
              continue;
            }
            if (!sortedGames.has(pb.srcGameId)) {
              sortedGames.set(pb.srcGameId, {
                gameId: pb.srcGameId,
                gameName: pb.srcGameName,
                gameUrl: pb.srcGameUrl,
                gameCoverUrl: pb.srcGameCoverUrl,
                entries: [],
              });
            }
            sortedGames.get(pb.srcGameId).entries.push(pb);
          }
          pbData = [];
          for (const [_, gameData] of sortedGames) {
            // Drop games with no runs (this shouldnt happen anyway)
            if (gameData.entries.length <= 0) {
              continue;
            }
            pbData.push(gameData);
          }
          // Now sort the games according to the configuration
          pbData.sort((gameA, gameB) => {
            if (cfg.config.gameData.gameSorting === "alpha") {
              return gameA.gameName.localeCompare(gameB.gameName);
            } else if (cfg.config.gameData.gameSorting === "num") {
              return gameA.entries.length - gameB.entries.length;
            } else if (cfg.config.gameData.gameSorting === "recent") {
              // Find the most recent run in each game
              let runGameA = gameA.entries[0].srcRunDate;
              for (const run of gameA.entries) {
                if (run.srcRunDate > runGameA) {
                  runGameA = run.srcRunDate;
                }
              }
              let runGameB = gameB.entries[0].srcRunDate;
              for (const run of gameB.entries) {
                if (run.srcRunDate > runGameB) {
                  runGameB = run.srcRunDate;
                }
              }
              return runGameB.valueOf() - runGameA.valueOf();
            }
          });
          // And sort the entries for each game similarly
          for (const gameData of pbData) {
            gameData.entries.sort((entryA, entryB) => {
              if (cfg.config.gameData.entrySorting === "alpha") {
                return entryA
                  .getCategoryOrLevelName()
                  .localeCompare(entryB.getCategoryOrLevelName());
              } else if (cfg.config.gameData.entrySorting === "place") {
                return entryA.srcLeaderboardPlace - entryB.srcLeaderboardPlace;
              } else if (cfg.config.gameData.entrySorting === "recent") {
                return (
                  entryB.srcRunDate.valueOf() - entryA.srcRunDate.valueOf()
                );
              }
            });
          }
          pbData = pbData;
        }
        pbDataLoaded = true;
      }
    });
  });

  function extractMilliseconds(time: number): number | undefined {
    if (time % 1 != 0) {
      return (time % 1) * 1000;
    }
    return undefined;
  }

  function formatTime(
    original_seconds: number,
    show_seconds: boolean,
    show_milliseconds: boolean,
  ): string {
    const milliseconds = extractMilliseconds(original_seconds);
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
    if (show_seconds && seconds > 0) {
      result += `${seconds}s `;
    }
    if (show_milliseconds && milliseconds !== undefined) {
      result += `${Math.trunc(milliseconds)}ms `;
    }
    return result.trim();
  }
</script>

<main data-cy="extension-panel">
  {#if pbDataLoaded && pbData !== undefined}
    {#each pbData as gameData}
      <sl-details class="game-pane" data-cy="panel-game">
        <div slot="summary" class="game-header">
          <!-- SRC ISSUE - https://github.com/speedruncomorg/api/issues/169 -->
          <img
            src={gameData.gameCoverUrl === undefined
              ? null
              : gameData.gameCoverUrl.replace("gameasset/", "static/game/")}
            alt="Cover art for {gameData.gameName}"
            class="game-cover"
            data-cy="panel-game-cover"
          />
          <div class="game-header-text-wrapper">
            <!-- TODO - ellipsis not rendering properly -->
            <span
              class="game-name"
              title={gameData.gameName}
              data-cy="panel-game-name"
              ><a
                href={gameData.gameUrl}
                target="_blank"
                rel="noopener noreferrer">{gameData.gameName}</a
              ></span
            >
            <br />
            <span data-cy="panel-game-count" class="game-entry-count"
              >{gameData.entries.length} Runs</span
            >
          </div>
        </div>
        {#each gameData.entries as entry}
          <div data-cy="panel-game-entry" class="row game-entry">
            <div class="col entry-name">
              <span
                ><a
                  href={entry.srcRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {#if getThemeData(cfg.config).showPlace}
                    <span class="entry-place"
                      >[{entry.srcLeaderboardPlace}]</span
                    >
                  {/if}
                  {entry.getCategoryOrLevelName()}
                </a></span
              >
            </div>
            <div
              class="entry-time"
              class:rainbow-cycle={getThemeData(cfg.config)
                .showRainbowWorldRecord && entry.srcLeaderboardPlace === 1}
            >
              <span>{formatTime(entry.srcRunTime, true, true)}</span>
            </div>
          </div>
        {/each}
      </sl-details>
    {/each}
  {:else if cfg.configInvalid === true}
    <div class="spinner-container" data-cy="panel-bad-config">
      {#if cfg.configError}
        <h3>{cfg.configError}</h3>
      {:else}
        <h3>Invalid Configuration</h3>
      {/if}
    </div>
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
    font-family: var(--font-family-sans), sans-serif;
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
    font-size: 10pt;
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
    font-size: 9pt;
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
