<script lang="ts">
  import { getThemeData } from "@lib/config";
  import { getUsersPersonalBests, PersonalBest } from "@lib/src-api";
  import { configStore } from "@lib/stores/config";
  import { onMount } from "svelte";
  import "@shoelace-style/shoelace/dist/components/details/details.js";

  $: cfg = $configStore;

  let pbData: Map<string, PersonalBest>;

  onMount(async () => {
    configStore.subscribe(async () => {
      console.log("Config changed");
      if (cfg.loaded) {
        console.log(cfg.config);
        // TODO - handle nothing being found
        // Request SRC for all PBs, not all information is stored in the config settings (times, cover art, etc)
        pbData = await getUsersPersonalBests(cfg.config.gameData.userSrcId);
        // Filter out the Games/Categories we don't care about to make simplify rendering
      }
    });
  });

  // TODO - split up component

  function getLiveData(dataId: string): PersonalBest {
    // TODO - handle nothing being found!
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
  {#if cfg.loaded && pbData}
    {#each cfg.config.gameData.games as game}
      <!-- TODO - handle no entries! -->
      <sl-details class="game-pane">
        <div slot="summary" class="game-header">
          <!-- SRC ISSUE - https://github.com/speedruncomorg/api/issues/169 -->
          <img
            src={getLiveData(game.entries[0].dataId).srcGameCoverUrl.replace(
              "gameasset/",
              "static/game/",
            )}
            alt="Cover art for {game.title}"
            class="game-cover"
          />
          <div class="game-header-text-wrapper">
            <span class="game-name" title={game.title}
              ><a
                href={getLiveData(game.entries[0].dataId).srcGameUrl}
                target="_blank"
                rel="noopener noreferrer">{game.title}</a
              ></span
            >
            <br />
            <span class="game-entry-count">{game.entries.length} Runs</span>
          </div>
        </div>
        {#each game.entries as entry}
          <div class="row game-entry">
            <div class="col-8 entry-name">
              <span
                ><a
                  href={getLiveData(entry.dataId).srcRunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {#if getThemeData(cfg.config).showPlace}
                    <span class="entry-place"
                      >[{getLiveData(entry.dataId).srcLeaderboardPlace}]</span
                    >
                  {/if}
                  {getLiveData(entry.dataId).srcCategoryName}</a
                ></span
              >
            </div>
            <div
              class="col entry-time"
              class:rainbow-cycle={getThemeData(cfg.config)
                .showRainbowWorldRecord &&
                getLiveData(entry.dataId).srcLeaderboardPlace === 1}
            >
              <span>{formatTime(getLiveData(entry.dataId).srcRunTime)}</span>
            </div>
          </div>
        {/each}
      </sl-details>
    {/each}
  {/if}
</main>

<style>
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
  }

  .game-entry:nth-child(odd) {
    background-color: var(--src-twitch-ext-color-gameEntriesAlternateRow);
  }

  .entry-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--src-twitch-ext-font-color-gameEntry);
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
