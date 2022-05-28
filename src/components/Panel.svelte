<script lang="ts">
import { ConfigData, GameData, LocalConfigService } from "@src/lib/config";
import { getUsersPersonalBests, PersonalBest } from "@src/lib/src-api";
import { onMount } from "svelte";
import { get } from "svelte/store";

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
    return pbData.get(dataId);
  }
</script>

<main>
  {#if configData && pbData}
    {#each configData.gameData.games as game}
    <sl-details class="game-pane">
      <div slot="summary" class="game-header">
        <img src={getLiveData(game.entries[0].dataId).srcGameCoverUrl} alt="todo" class="game-cover">
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
    font-family: 'Rubik', sans-serif;
    height: 500px; /* Twitch says 496px */
    width: 318px;
    background-color: #212026;
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
    color: #DFDDE2;
  }

  .game-name {
    font-size: 12pt;
    font-weight: 700;
    color: #DFDDE2;
    margin-left: 10px;
  }

  .game-name a {
    text-decoration: none;
    color: #FFFFFF;
  }

  .game-name a:hover {
    color: red;
  }

  .game-entry-count {
    margin-left: 10px;
    color: #A299B0;
    font-size: 10pt;
  }

  .game-entry {
    font-size: 10pt;
    font-weight: 500;
    color: #FFFFFF;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .game-entry:nth-child(odd) {
    background-color: #111113;
  }

  .entry-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-name a {
    text-decoration: none;
    color: #FFFFFF;
  }

  .entry-name a:hover {
    color: red;
  }

  .entry-time {
    font-size: 9pt;
    display: flex;
    justify-content: right;
  }

  .game-pane {
    margin-bottom: 0.25em;
  }

  .game-pane::part(header) {
    background-color: #322F37;
    padding: 10px;
  }

  .game-pane::part(summary) {
    width: 100%;
  }

  .game-pane::part(summary-icon) {
    color: #DFDDE2;
  }

  .game-pane::part(content) {
    background-color: #212026;
  }
</style>
