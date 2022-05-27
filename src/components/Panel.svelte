<script lang="ts">
import { GameData, LocalConfigService } from "@src/lib/config";
import { getUsersPersonalBests, PersonalBestCollection } from "@src/lib/src-api";
import { onMount } from "svelte";

  let configService = new LocalConfigService();
  let configData;
  let pbData;

  // Filter and Properly Order Personal Bests
  function preparePersonalBests(pbData: PersonalBestCollection[], gameData : GameData) : PersonalBestCollection[] {
    let filteredData = [];

    for (const game of gameData.games) {
      // If the game is disabled
      game.titleTemplateOverride
      if (game.isDisabled) {
        continue;
      }
    }

    return filteredData;
  }

  onMount(async () => {
		// Get the user's configuration
    configData = configService.getBroadcasterConfig();
    // TODO - handle nothing being found
    // Request SRC for all PBs, not all information is stored in the config settings (times, cover art, etc)
    pbData = await getUsersPersonalBests(configData.gameData.srcId);
    // Filter out the Games/Categories we don't care about to make simplify rendering
	});
</script>

<main>
  {#each configData.gameData as game}
  <sl-details class="game-pane">
    <div slot="summary" class="game-header">
      <img src="https://www.speedrun.com/gameasset/ok6qlo1g/cover?v=c8fb842" class="game-cover">
      <div class="game-header-text-wrapper">
        <span class="game-name" title="FULL THING"><a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Jak II</a></span>
        <br>
        <span class="game-entry-count">X Runs</span>
      </div>
    </div>
  </sl-details>
  {/each}


  <!--
	<sl-details  class="game-pane">
    <div slot="summary" class="game-header">
      <img src="https://www.speedrun.com/gameasset/ok6qlo1g/cover?v=c8fb842" class="game-cover">
      <div class="game-header-text-wrapper">
        <span class="game-name" title="FULL THING"><a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Jak II</a></span>
        <br>
        <span class="game-entry-count">X Runs</span>
      </div>
    </div>
    <div class="pure-g game-entry">
      <div class="pure-u-3-5 entry-name">
        <span><a href="https://www.google.com" target="_blank" rel="noopener noreferrer">Category Nameeeeeeeeeeeeeeeeeeeeee</a></span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span><a href="http://www.google.com" target="_blank" rel="noopener noreferrer">00:00:00</a></span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span><a href="http://www.google.com" target="_blank" rel="noopener noreferrer">00:00:00</a></span>
      </div>
    </div>
    <div class="pure-g game-entry">
      <div class="pure-u-3-5">
        <span>Category Name</span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span>00:00:00</span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span>00:00:00</span>
      </div>
    </div>
    <div class="pure-g game-entry">
      <div class="pure-u-3-5">
        <span>Category Name</span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span>00:00:00</span>
      </div>
      <div class="pure-u-1-5 entry-time">
        <span>00:00:00</span>
      </div>
    </div>
  </sl-details>
  -->
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

  .entry-time {
    font-size: 9pt;
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
