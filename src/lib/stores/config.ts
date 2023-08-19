import {
  ConfigData,
  ConfigService,
  LocalConfigService,
  TwitchConfigService,
  getThemeData,
  updateCSSVars,
} from "@lib/config";
import { log } from "@lib/logging";
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
    log("config ready");
    if (service.broadcasterConfigExists()) {
      log("using existing broadcaster config");
      return service.getBroadcasterConfig();
    }
    log("could not find existing broadcaster config");
    // TODO - handle if this is a temporary issue (config service outage) or they just don't already have a config
    return undefined;
  }

  return {
    subscribe,
    init: (forConfig: boolean) =>
      update((val) => {
        const searchParams = new URLSearchParams(window.location.search);
        const onTwitch =
          searchParams.has("twitch") && searchParams.get("twitch") === "true";
        if (
          !onTwitch &&
          (window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "localhost")
        ) {
          log(`using local host config - ${window.location}`);
          val.service = new LocalConfigService();
          if (val.config === undefined) {
            if (forConfig) {
              val.config = loadConfig(val.service);
            } else {
              val.config = new ConfigData();
            }
            const themeData = getThemeData(val.config);
            updateCSSVars(themeData);
            val.loaded = true;
          }
        } else if (window.Twitch && window.Twitch.ext) {
          // Twitch's extension helper makes heavy use of the window object
          // so this is a little clunky to work with unfortunately
          log("on twitch!");
          val.service = new TwitchConfigService(window);
          // Setup Twitch callbacks
          window.Twitch.ext.configuration.onChanged(() => {
            // Despite the name, this is only called once when the extension first loads
            log("twitch - config loaded or changed");
            if (val.config === undefined) {
              if (forConfig) {
                val.config = loadConfig(val.service);
              } else {
                val.config = new ConfigData();
              }
              const themeData = getThemeData(val.config);
              updateCSSVars(themeData);
              val.loaded = true;
            }
          });
          window.Twitch.ext.onAuthorized((auth) => {
            log("twitch - authed!");
            if (val.config === undefined) {
              if (forConfig) {
                val.config = loadConfig(val.service);
              } else {
                val.config = new ConfigData();
              }
              const themeData = getThemeData(val.config);
              updateCSSVars(themeData);
              val.loaded = true;
            }
          });
          // TODO - register `onContext` to react to things like theme changes
        } else {
          log("unable to determine the config source");
        }
        return val;
      }),
    commit: () =>
      update((val) => {
        const searchParams = new URLSearchParams(window.location.search);
        const onTwitch =
          searchParams.has("twitch") && searchParams.get("twitch") === "true";
        if (
          !onTwitch &&
          (window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "localhost")
        ) {
          log("persisting local host config");
          val.service.setBroadcasterConfig(val.config);
        } else if (window.Twitch && window.Twitch.ext) {
          log("TODO");
        } else {
          log("unable to determine the config source");
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
