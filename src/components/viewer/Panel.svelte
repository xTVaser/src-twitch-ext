<script lang="ts">
import { ConfigData, LocalConfigService } from "@lib/config";
import { getUsersPersonalBests, PersonalBest } from "@lib/src-api";
import { onMount } from "svelte";

  let configService = new LocalConfigService();
  let configData : ConfigData;
  let pbData : Map<string, PersonalBest>;

  onMount(async () => {
		// Get the user's configuration
    configData = configService.getBroadcasterConfig();
    // TODO - handle nothing being found
    // Request SRC for all PBs, not all information is stored in the config settings (times, cover art, etc)
    pbData = await getUsersPersonalBests(configData.gameData.userSrcId);
    // Filter out the Games/Categories we don't care about to make simplify rendering
	});

  // TODO - split up component

  function getLiveData(dataId: string) : PersonalBest {
    // TODO - handle nothing being found!
    return pbData.get(dataId);
  }
</script>

<main>
  {#if configData && pbData}
    {#each configData.gameData.games as game}
    <!-- TODO - handle no entries! -->
    <sl-details class="game-pane">
      <div slot="summary" class="game-header">
        <img src={getLiveData(game.entries[0].dataId).srcGameCoverUrl} alt="Cover art for {game.title}" class="game-cover">
        <div class="game-header-text-wrapper">
          <span class="game-name" title={game.title}><a href={getLiveData(game.entries[0].dataId).srcGameUrl} target="_blank" rel="noopener noreferrer">{game.title}</a></span>
          <br>
          <span class="game-entry-count">{game.entries.length} Runs</span>
        </div>
      </div>
      {#each game.entries as entry}
        <div class="pure-g game-entry">
          <div class="pure-u-4-5 entry-name">
            <span><a href={getLiveData(entry.dataId).srcRunUrl} target="_blank" rel="noopener noreferrer">{getLiveData(entry.dataId).srcCategoryName}</a></span>
          </div>
          <div class="pure-u-1-5 entry-time">
            <span>{getLiveData(entry.dataId).srcRunTime}</span>
          </div>
        </div>
      {/each}
    </sl-details>
    {/each}
  {/if}
</main>

<style>
  main {
    font-family: "Rubik", sans-serif;
    height: 500px; /* TODO - Twitch says 496px */
    width: 318px;
    background-color: var(--src-twitch-ext-color-mainBackground);
    overflow-y: scroll;
  }

  .pure-g [class*="pure-u"] {
    font-family: 'Rubik', sans-serif;
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

  .entry-time {
    font-size: 9pt;
    font-family: var(--src-twitch-ext-font-family-gameEntryTime), sans-serif;
    font-weight: var(--src-twitch-ext-font-weight-gameEntryTime);
    font-style: var(--src-twitch-ext-font-style-gameEntryTime);
    color: var(--src-twitch-ext-font-color-gameEntryTime);
    display: flex;
    justify-content: right;
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
  }

  .game-pane::part(content) {
    background-color: var(--src-twitch-ext-color-gameEntriesBackground);
  }
</style>
