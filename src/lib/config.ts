import type { PersonalBest } from "./src-api";

export class GameDataEntrySettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public titleOverride: string = "";
  // The ID used to join with live data
  constructor(public dataId: string) {}
}

export class GameDataGamesSettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public showMilliseconds: boolean = false;
  public showSeconds: boolean = true;
  public autoExpanded: boolean = false;
  public entries: GameDataEntrySettings[] = [];
  constructor(
    public srcId: string,
    public title: string,
  ) {}
}

export class GameData {
  userSrcId: string = undefined;
  userSrcName: string = undefined;
  games: GameDataGamesSettings[] = [];

  static initFromPersonalBestData(pbData: Map<string, PersonalBest>): GameData {
    let newGameData = new GameData();
    // This setup is a little inefficient, we want to store everything here
    // in an ordered fashion (so no maps)
    //
    // In normal operation, data is retrieved in the opposite manner (we have this data
    // and we lookup in the live data)
    for (const [dataId, pb] of pbData) {
      // Find the game, create it if we havn't reached it yet
      let game = newGameData.games.find((game) => game.srcId === pb.srcGameId);
      if (game === undefined) {
        game = new GameDataGamesSettings(pb.srcGameId, pb.srcGameName);
        newGameData.games.push(game);
      }
      // Append new PB
      game.entries.push(new GameDataEntrySettings(dataId));
    }
    // Order games by title
    newGameData.games.sort((a, b) => a.title.localeCompare(b.title));
    // Do a rough ordering by the data id, this will roughly put things into groups
    // TODO - improve this
    for (let game of newGameData.games) {
      game.entries.sort((a, b) => a.dataId.localeCompare(b.dataId));
    }
    return newGameData;
  }
}

export interface ThemeData {
  defaultTheme: boolean;
  // Flags
  hideExpandIcon: boolean;
  showRainbowWorldRecord: boolean;
  showPlace: boolean;
  // Colors
  mainBackgroundColor: string;
  gameHeaderBackgroundColor: string;
  gameEntriesBackgroundColor: string;
  gameEntriesAlternateRowColor: string;
  gameNameLinkHoverColor: string;
  gameEntryLinkHoverColor: string;
  gameExpandIconColor: string;
  // Fonts
  gameNameFontColor: string;
  gameNameSubheaderFontColor: string;
  gameEntryFontColor: string;
  gameEntryTimeFontColor: string;
}

export function updateCSSVars(themeData: ThemeData) {
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-mainBackground`,
    themeData.mainBackgroundColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameHeaderBackground`,
    themeData.gameHeaderBackgroundColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameEntriesBackground`,
    themeData.gameEntriesBackgroundColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameEntriesAlternateRow`,
    themeData.gameEntriesAlternateRowColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameNameLinkHover`,
    themeData.gameNameLinkHoverColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameEntryLinkHover`,
    themeData.gameEntryLinkHoverColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameExpandIcon`,
    themeData.gameExpandIconColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-gameExpandIconVisibility`,
    themeData.hideExpandIcon ? "hidden" : "visible",
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-font-color-gameName`,
    themeData.gameNameFontColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-font-color-gameNameSubheader`,
    themeData.gameNameSubheaderFontColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-font-color-gameEntry`,
    themeData.gameEntryFontColor,
  );
  document.documentElement.style.setProperty(
    `--src-twitch-ext-font-color-gameEntryTime`,
    themeData.gameEntryTimeFontColor,
  );
}

export const DefaultDarkTheme: ThemeData = {
  defaultTheme: true,
  hideExpandIcon: false,
  showRainbowWorldRecord: true,
  showPlace: false,
  mainBackgroundColor: "#212026",
  gameHeaderBackgroundColor: "#322F37",
  gameEntriesBackgroundColor: "#212026",
  gameEntriesAlternateRowColor: "#111113",
  gameNameLinkHoverColor: "red", // TODO - change
  gameEntryLinkHoverColor: "orange", // TODO - change
  gameExpandIconColor: "#DFDDE2",
  gameNameFontColor: "#DFDDE2",
  gameNameSubheaderFontColor: "#A299B0",
  gameEntryFontColor: "#FFFFFF",
  gameEntryTimeFontColor: "#FFFFFF",
};

export function getDefaultTheme(themeName: string | undefined): ThemeData {
  if (themeName === `_default-dark`) {
    return DefaultDarkTheme;
  }
  return DefaultDarkTheme;
}

export class ConfigData {
  gameData: GameData = new GameData();
  currentThemeName: string = "_default-dark";
  customThemes: Map<string, ThemeData> = new Map<string, ThemeData>();
}

export function getThemeData(configData: ConfigData | undefined): ThemeData {
  if (configData === undefined) {
    return getDefaultTheme(undefined);
  }
  if (configData.currentThemeName.startsWith("_default-")) {
    return getDefaultTheme(configData.currentThemeName);
  }
  if (configData.currentThemeName in configData.customThemes) {
    return configData.customThemes[configData.currentThemeName];
  }
  return DefaultDarkTheme;
}

interface TwitchConfigEntry {
  content: string;
  version: string;
}

interface TwitchConfigObject {
  broadcaster?: TwitchConfigEntry;
  developer?: TwitchConfigEntry;
  global?: TwitchConfigEntry;
}

export abstract class ConfigService {
  abstract broadcasterConfigExists(): boolean;
  abstract getBroadcasterConfig(): ConfigData | undefined;
  abstract setBroadcasterConfig(data: ConfigData);
  abstract developerConfigExists(): boolean;
  abstract getDeveloperConfig(): any;
  abstract setDeveloperConfig(data: any);
}

export class LocalConfigService extends ConfigService {
  broadcasterConfigExists(): boolean {
    if (localStorage.getItem("src-twitch-ext") !== null) {
      const data: TwitchConfigObject = JSON.parse(
        localStorage.getItem("src-twitch-ext"),
      );
      return data.broadcaster !== undefined;
    }
    return false;
  }
  developerConfigExists(): boolean {
    return localStorage.getItem("src-twitch-ext") !== null;
  }
  getBroadcasterConfig(): ConfigData | undefined {
    let data = localStorage.getItem("src-twitch-ext");
    if (data == null) {
      return undefined;
    }
    let config: TwitchConfigObject = JSON.parse(data);
    if (config.broadcaster === undefined) {
      return undefined;
    }
    return JSON.parse(config.broadcaster.content);
  }
  getDeveloperConfig() {
    throw new Error("Method not implemented.");
  }
  setBroadcasterConfig(data: ConfigData) {
    let config: TwitchConfigObject;
    console.log(data);
    if (localStorage.getItem("src-twitch-ext") === null) {
      config = {
        broadcaster: {
          version: "1.0.0",
          content: JSON.stringify(data),
        },
      };
    } else {
      config = JSON.parse(localStorage.getItem("src-twitch-ext"));
      config.broadcaster = {
        version: "1.0.0",
        content: JSON.stringify(data),
      };
    }
    localStorage.setItem("src-twitch-ext", JSON.stringify(config));
  }
  setDeveloperConfig(data: any) {
    throw new Error("Method not implemented.");
  }
}

export class TwitchConfigService extends ConfigService {
  private windowInstance: any;
  constructor(windowInstance: any) {
    super();
    this.windowInstance = windowInstance;
  }
  broadcasterConfigExists(): boolean {
    return (
      this.windowInstance.Twitch.ext.configuration.broadcaster !== undefined
    );
  }
  getBroadcasterConfig(): ConfigData {
    return JSON.parse(
      this.windowInstance.Twitch.ext.configuration.broadcaster.content,
    );
  }
  setBroadcasterConfig(data: any) {
    this.windowInstance.Twitch.ext.configuration.set(
      "broadcaster",
      "1.0",
      JSON.stringify(data),
    );
  }
  developerConfigExists(): boolean {
    throw new Error("Method not implemented.");
  }
  getDeveloperConfig() {
    throw new Error("Method not implemented.");
  }

  setDeveloperConfig(data: any) {
    throw new Error("Method not implemented.");
  }
}
