<script lang="ts">
  import Panel from "@components/viewer/Panel.svelte";
  import { DefaultDarkTheme, getThemeData } from "@lib/config";
  import { configStore } from "@lib/stores/config";
  import { notify } from "@lib/toast";
  import { onMount } from "svelte";
  import "@shoelace-style/shoelace/dist/components/select/select.js";
  import "@shoelace-style/shoelace/dist/components/option/option.js";
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import "@shoelace-style/shoelace/dist/components/divider/divider.js";
  import "@shoelace-style/shoelace/dist/components/input/input.js";
  import "@shoelace-style/shoelace/dist/components/switch/switch.js";
  import "@shoelace-style/shoelace/dist/components/color-picker/color-picker.js";

  function isThemeCustom(themeName: string): boolean {
    return themeName.startsWith("_custom-");
  }

  $: cfg = $configStore;

  let originalThemeData = undefined;
  let newCustomThemeName = "";

  $: changesToSave =
    cfg.loaded &&
    isThemeCustom(cfg.config.currentThemeName) &&
    JSON.stringify(getThemeData(cfg.config)) !==
      JSON.stringify(originalThemeData);

  onMount(async () => {
    configStore.subscribe(async () => {
      if (cfg.loaded && originalThemeData === undefined) {
        console.log("updating original theme data");
        originalThemeData = structuredClone(getThemeData(cfg.config));
      }
    });
  });

  function createNewTheme() {
    const themeName = `_custom-${newCustomThemeName}`;
    if (themeName in cfg.config.customThemes) {
      notify(
        "Theme with that name already exists",
        "danger",
        "exclamation-octagon",
        3000,
      );
    } else {
      cfg.config.customThemes[themeName] = DefaultDarkTheme;
      cfg.config.customThemes[themeName].defaultTheme = false;
      cfg.config.currentThemeName = themeName;
      cfg.service.setBroadcasterConfig(cfg.config);
      notify(`New Theme Created!`, "success", "check2-circle", 1500);
    }
    newCustomThemeName = "";
  }

  function customThemeNames(names: String[]): String[] {
    return names
      .filter((name) => name.startsWith("_custom-"))
      .map((name) => name.replace(/_custom-/, ""));
  }

  function deleteCurrentCustomTheme() {
    delete cfg.config.customThemes[cfg.config.currentThemeName];
    cfg.config.currentThemeName = "_default-dark";
    cfg.service.setBroadcasterConfig(cfg.config);
  }

  function saveThemeChanges() {
    configStore.commit();
    originalThemeData = structuredClone(getThemeData(cfg.config));
  }
</script>

{#if cfg.loaded}
  <div class="row mb-1">
    <div class="col mr-1">
      <sl-select
        value={cfg.config.currentThemeName}
        label="Theme Selector"
        class="mb-1"
        data-cy="theme-selector"
        on:sl-change={(event) => {
          cfg.config.currentThemeName = event.target.value;
          console.log(cfg.config.currentThemeName);
        }}
      >
        <small>Default Themes</small>
        <sl-option value="_default-dark">Default Dark</sl-option>
        {#if Object.keys(cfg.config.customThemes).length > 0}
          <sl-divider />
          <small>Custom Themes</small>
          {#each customThemeNames(Object.keys(cfg.config.customThemes)) as themeName}
            <sl-option value={`_custom-${themeName}`}>{themeName}</sl-option>
          {/each}
        {/if}
      </sl-select>
      <div class="row is-vertically-aligned-end gap-1">
        <div class="col">
          <sl-input
            label="New Theme Name"
            value={newCustomThemeName}
            data-cy="new-theme-input"
            on:sl-input={(event) => {
              newCustomThemeName = event.target.value.trim();
            }}>{newCustomThemeName}</sl-input
          >
        </div>
        <div class="col">
          <sl-button
            variant="primary"
            disabled={newCustomThemeName === ""}
            data-cy="create-theme-btn"
            on:click={createNewTheme}>Create New Theme</sl-button
          >
        </div>
      </div>
      <br />
      <div class="row gap-1">
        {#if isThemeCustom(cfg.config.currentThemeName)}
          <sl-button
            variant="danger"
            disabled={isThemeCustom(cfg.config.currentThemeName)
              ? undefined
              : true}
            data-cy="delete-theme-btn"
            on:click={deleteCurrentCustomTheme}>Delete Current Theme</sl-button
          >
        {/if}
        {#if changesToSave}
          <sl-button
            variant="warning"
            disabled={changesToSave ? undefined : true}
            data-cy="revert-changes-btn">Revert Changes</sl-button
          >
          <sl-button
            variant="success"
            disabled={changesToSave ? undefined : true}
            data-cy="save-changes-btn"
            on:click={saveThemeChanges}>Save Changes</sl-button
          >
        {/if}
      </div>
    </div>
    <div class="col">
      <Panel />
    </div>
  </div>
  {#if isThemeCustom(cfg.config.currentThemeName)}
    {JSON.stringify(getThemeData(cfg.config))}
    <div class="row setting-row">
      <div class="col">
        <span>Hide Expand Icon</span>
      </div>
      <div class="col">
        <sl-switch
          data-cy="hide-expand-icon-switch"
          checked={getThemeData(cfg.config).hideExpandIcon ? true : undefined}
          on:input={(event) => {
            configStore.setValueOnCurrentTheme(
              "hideExpandIcon",
              event.target.checked,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Rainbow World Record Time</span>
      </div>
      <div class="col">
        <sl-switch
          data-cy="rainbow-world-record-switch"
          checked={getThemeData(cfg.config).showRainbowWorldRecord
            ? true
            : undefined}
          on:input={(event) => {
            configStore.setValueOnCurrentTheme(
              "showRainbowWorldRecord",
              event.target.checked,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Show Leaderboard Place</span>
      </div>
      <div class="col">
        <sl-switch
          data-cy="show-lb-place-switch"
          checked={getThemeData(cfg.config).showPlace ? true : undefined}
          on:input={(event) => {
            configStore.setValueOnCurrentTheme(
              "showPlace",
              event.target.checked,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Expand Icon Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="expand-icon-color"
          value={getThemeData(cfg.config).gameExpandIconColor}
          on:blur={(event) => {
            console.log("blurred");
            configStore.setValueOnCurrentTheme(
              "gameExpandIconColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Main Background Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="main-bg-color"
          value={getThemeData(cfg.config).mainBackgroundColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "mainBackgroundColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Header Background Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="game-header-bg-color"
          value={getThemeData(cfg.config).gameHeaderBackgroundColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "gameHeaderBackgroundColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Entry Background Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="game-entry-bg-color"
          value={getThemeData(cfg.config).gameEntriesBackgroundColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "gameEntriesBackgroundColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Entry Odd Row Background Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="game-entry-odd-bg-color"
          value={getThemeData(cfg.config).gameEntriesAlternateRowColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "gameEntriesAlternateRowColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Name Link Hover Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="game-name-link-hover-color"
          value={getThemeData(cfg.config).gameNameLinkHoverColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "gameNameLinkHoverColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Entry Link Hover Color</span>
      </div>
      <div class="col">
        <sl-color-picker
          data-cy="game-entry-link-hover-color"
          value={getThemeData(cfg.config).gameEntryLinkHoverColor}
          on:blur={(event) => {
            configStore.setValueOnCurrentTheme(
              "gameEntryLinkHoverColor",
              event.target.value,
            );
          }}
        />
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Name Font</span>
      </div>
      <div class="col">
        <div class="row is-vertical-align">
          <sl-color-picker
            data-cy="game-name-font-color"
            value={getThemeData(cfg.config).gameNameFontColor}
            on:blur={(event) => {
              configStore.setValueOnCurrentTheme(
                "gameNameFontColor",
                event.target.value,
              );
            }}
          />
        </div>
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Name Subheader Font</span>
      </div>
      <div class="col">
        <div class="row is-vertical-align">
          <sl-color-picker
            data-cy="game-name-subheader-font-color"
            value={getThemeData(cfg.config).gameNameSubheaderFontColor}
            on:blur={(event) => {
              configStore.setValueOnCurrentTheme(
                "gameNameSubheaderFontColor",
                event.target.value,
              );
            }}
          />
        </div>
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Entry Font</span>
      </div>
      <div class="col">
        <div class="row is-vertical-align">
          <sl-color-picker
            data-cy="game-entry-font-color"
            value={getThemeData(cfg.config).gameEntryFontColor}
            on:blur={(event) => {
              configStore.setValueOnCurrentTheme(
                "gameEntryFontColor",
                event.target.value,
              );
            }}
          />
        </div>
      </div>
    </div>
    <div class="row setting-row">
      <div class="col">
        <span>Game Entry Time Font</span>
      </div>
      <div class="col">
        <div class="row is-vertical-align">
          <sl-color-picker
            data-cy="game-entry-time-font-color"
            value={getThemeData(cfg.config).gameEntryTimeFontColor}
            on:blur={(event) => {
              configStore.setValueOnCurrentTheme(
                "gameEntryTimeFontColor",
                event.target.value,
              );
            }}
          />
        </div>
      </div>
    </div>
  {/if}
{:else}
  TODO
{/if}

<style>
  .is-vertically-aligned-end {
    align-items: flex-end;
  }

  .mb-1 {
    margin-bottom: 1em;
  }

  .mr-1 {
    margin-right: 1em;
  }

  .gap-1 {
    gap: 1em;
  }

  .setting-row {
    align-items: center;
    padding: 1em;
  }

  .setting-row:nth-child(even) {
    background-color: #18181b;
  }
</style>
