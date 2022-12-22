<script lang="ts">
  import Panel from "@components/viewer/Panel.svelte";
</script>

<div class="container">
  <div class="pure-g">
    <div class="pure-u mr-1">
      <Panel />
    </div>
    <div class="pure-u">
      <sl-select value="default-dark" label="Theme Preset Selector" class="mb-1">
        <sl-menu-label>Default Themes</sl-menu-label>
        <sl-menu-item value="default-dark">Default Dark</sl-menu-item>
        <sl-divider></sl-divider>
        <sl-menu-label>Custom Themes</sl-menu-label>
        <sl-menu-item value="my-theme">My Theme</sl-menu-item>
      </sl-select>
      <div class="pure-g center-row mb-1">
        <div class="pure-u mr-1">
          <sl-input label="New Preset Name" help-text="Enter a name, can't start with 'default'"></sl-input>
        </div>
        <div class="pure-u">
          <sl-button variant="primary">Create New Preset</sl-button>
        </div>
      </div>
      <br>
      <sl-button variant="warning" class="mr-1">Revert Changes</sl-button>
      <sl-button variant="success" class="mb-1">Save Changes to Current Preset</sl-button>
      <br>
      <sl-textarea label="Theme Data" help-text="Use this to backup or restore a preset" class="mb-1"></sl-textarea>
      <sl-button variant="primary" class="mb-1">Restore Preset</sl-button>
    </div>
  </div>
  <div class="pure-g mt-2 mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Hide Expand Icon</span>
    </div>
    <div class="pure-u-2-3">
      <sl-switch checked />
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Main Background Color</span>
    </div>
    <div class="pure-u-2-3">
      <sl-color-picker value="#4a90e2" />
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Background Color</span>
    </div>
    <div class="pure-u-2-3">
      <sl-color-picker value="#4a90e2" />
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Entry Odd Row Color</span>
    </div>
    <div class="pure-u-2-3">
      <sl-color-picker value="#4a90e2" />
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Name Font Settings</span>
    </div>
    <div class="pure-u-2-3">
      <div class="pure-g center-row">
        <div class="pure-u mr-1">
          <sl-select value="option-2" class="font-select">
            <sl-menu-item value="option-1">Option 1</sl-menu-item>
            <sl-menu-item value="option-2">Option 2</sl-menu-item>
            <sl-menu-item value="option-3">Option 3</sl-menu-item>
          </sl-select>
        </div>
        <div class="pure-u mr-1">
          <sl-color-picker value="#4a90e2" />
        </div>
        <div class="pure-u mr-1">
          <sl-switch checked>Bold</sl-switch>
        </div>
        <div class="pure-u">
          <sl-switch checked>Italic</sl-switch>
        </div>
      </div>
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Name Subheader Font Settings</span>
    </div>
    <div class="pure-u-2-3">
      <div class="pure-g center-row">
        <div class="pure-u mr-1">
          <sl-select value="option-2" class="font-select">
            <sl-menu-item value="option-1">Option 1</sl-menu-item>
            <sl-menu-item value="option-2">Option 2</sl-menu-item>
            <sl-menu-item value="option-3">Option 3</sl-menu-item>
          </sl-select>
        </div>
        <div class="pure-u mr-1">
          <sl-color-picker value="#4a90e2" />
        </div>
        <div class="pure-u mr-1">
          <sl-switch checked>Bold</sl-switch>
        </div>
        <div class="pure-u">
          <sl-switch checked>Italic</sl-switch>
        </div>
      </div>
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Entry Font Settings</span>
    </div>
    <div class="pure-u-2-3">
      <div class="pure-g center-row">
        <div class="pure-u mr-1">
          <sl-select value="option-2" class="font-select">
            <sl-menu-item value="option-1">Option 1</sl-menu-item>
            <sl-menu-item value="option-2">Option 2</sl-menu-item>
            <sl-menu-item value="option-3">Option 3</sl-menu-item>
          </sl-select>
        </div>
        <div class="pure-u mr-1">
          <sl-color-picker value="#4a90e2" />
        </div>
        <div class="pure-u mr-1">
          <sl-switch checked>Bold</sl-switch>
        </div>
        <div class="pure-u">
          <sl-switch checked>Italic</sl-switch>
        </div>
      </div>
    </div>
  </div>
  <div class="pure-g mb-1 setting-row">
    <div class="pure-u-1-3">
      <span>Game Entry Time Font Settings</span>
    </div>
    <div class="pure-u-2-3">
      <div class="pure-g center-row">
        <div class="pure-u mr-1">
          <sl-select value="option-2" class="font-select">
            <sl-menu-item value="option-1">Option 1</sl-menu-item>
            <sl-menu-item value="option-2">Option 2</sl-menu-item>
            <sl-menu-item value="option-3">Option 3</sl-menu-item>
          </sl-select>
        </div>
        <div class="pure-u mr-1">
          <sl-color-picker value="#4a90e2" />
        </div>
        <div class="pure-u mr-1">
          <sl-switch checked>Bold</sl-switch>
        </div>
        <div class="pure-u">
          <sl-switch checked>Italic</sl-switch>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .font-select::part(base) {
    max-width: 20em;
  }

  .mt-2 {
    margin-top: 2em;
  }

  .mb-1 {
    margin-bottom: 1em;
  }

  .mr-1 {
    margin-right: 1em;
  }

  .center-row {
    align-items: center;
  }

  .setting-row {
    align-items: center;
    padding: 1em;
  }

  .setting-row:nth-child(even) {
    background-color: #18181b;
  }
</style>
