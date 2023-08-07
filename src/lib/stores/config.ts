import {
  ConfigData,
  ConfigService,
  LocalConfigService,
  TwitchConfigService,
  getThemeData,
  updateCSSVars,
} from "@lib/config";
import { writable } from "svelte/store";

interface ConfigStore {
  loaded: boolean;
  service: ConfigService | undefined;
  config: ConfigData | undefined;
}

const storeValue: ConfigStore = {
  loaded: false,
  service: undefined,
  config: undefined,
};

function createConfigStore() {
  const { subscribe, set, update } = writable<ConfigStore>(storeValue);

  function loadConfig(service: ConfigService): ConfigData | undefined {
    console.log("config ready");
    if (service.broadcasterConfigExists()) {
      console.log("using existing broadcaster config");
      return service.getBroadcasterConfig();
    }
    console.log("could not find existing broadcaster config");
    // TODO - handle if this is a temporary issue (config service outage) or they just don't already have a config
    return new ConfigData();
  }

  return {
    subscribe,
    init: () =>
      update((val) => {
        if (
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "localhost"
        ) {
          console.log("using local host config");
          val.service = new LocalConfigService();
          val.config = loadConfig(val.service);
          val.loaded = true;
        } else if (window.Twitch && window.Twitch.ext) {
          // Twitch's extension helper makes heavy use of the window object
          // so this is a little clunky to work with unfortunately
          console.log("on twitch!");
          val.service = new TwitchConfigService(window);
          // Setup Twitch callbacks
          window.Twitch.ext.configuration.onChanged(() => {
            val.config = loadConfig(val.service);
            val.loaded = true;
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
        return val;
      }),
    commit: () =>
      update((val) => {
        if (
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "localhost"
        ) {
          console.log("persisting local host config");
          val.service.setBroadcasterConfig(val.config);
        } else if (window.Twitch && window.Twitch.ext) {
          console.log("TODO");
        } else {
          console.log("unable to determine the config source");
        }
        return val;
      }),
    setValueOnCurrentTheme: (key: string, themeValue: any) =>
      update((val) => {
        const themeData = getThemeData(val.config);
        themeData[key] = themeValue;
        updateCSSVars(themeData);
        return val;
      }),
  };
}

export const configStore = createConfigStore();
