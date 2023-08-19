import { log } from "./logging";
import type { PersonalBest } from "./src-api";
import { z } from "zod";

export class GameDataEntrySettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public showMilliseconds: boolean = false;
  public showSeconds: boolean = true;
  public titleOverride: string | null = null;
  // The ID used to join with live data
  constructor(public dataId: string) {}
}

export class GameDataGamesSettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public titleOverride: string | null = null;
  public autoExpanded: boolean = false;
  public entries: GameDataEntrySettings[] = [];
  constructor(
    public srcId: string,
    public title: string,
  ) {}
}

export class GameData {
  userSrcId: string | null = null;
  userSrcName: string | null = null;
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
  gameNameLinkHoverColor: "#a06bff",
  gameEntryLinkHoverColor: "#a06bff",
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
  version: string = "1.0";
  gameData: GameData = new GameData();
  currentThemeName: string = "_default-dark";
  customThemes: Map<string, ThemeData> = new Map<string, ThemeData>();
}

const ConfigDataSchema = z.object({
  version: z.string(),
  gameData: z.object({
    userSrcId: z.nullable(z.string()),
    userSrcName: z.nullable(z.string()),
    games: z.array(
      z.object({
        srcId: z.string(),
        title: z.string(),
        isDisabled: z.boolean(),
        overrideDefaults: z.boolean(),
        showMilliseconds: z.boolean(),
        showSeconds: z.boolean(),
        autoExpanded: z.boolean(),
        entries: z.array(
          z.object({
            dataId: z.string(),
            isDisabled: z.boolean(),
            overrideDefaults: z.boolean(),
            titleOverride: z.string(),
          }),
        ),
      }),
    ),
  }),
  currentThemeName: z.string(),
  customThemes: z.record(
    z.string(),
    z.object({
      defaultTheme: z.boolean(),
      hideExpandIcon: z.boolean(),
      showRainbowWorldRecord: z.boolean(),
      showPlace: z.boolean(),
      mainBackgroundColor: z.string(),
      gameHeaderBackgroundColor: z.string(),
      gameEntriesBackgroundColor: z.string(),
      gameEntriesAlternateRowColor: z.string(),
      gameNameLinkHoverColor: z.string(),
      gameEntryLinkHoverColor: z.string(),
      gameExpandIconColor: z.string(),
      gameNameFontColor: z.string(),
      gameNameSubheaderFontColor: z.string(),
      gameEntryFontColor: z.string(),
      gameEntryTimeFontColor: z.string(),
    }),
  ),
});

function isValidConfigData(jsonData: any): boolean {
  try {
    ConfigDataSchema.parse(jsonData);
    return true;
  } catch (e) {
    return false;
  }
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

export interface ConfigResponse {
  data: ConfigData | undefined;
  configInvalid: boolean;
  error: string | undefined;
}

export abstract class ConfigService {
  abstract broadcasterConfigExists(): boolean | undefined;
  abstract getBroadcasterConfig(): ConfigResponse;
  abstract setBroadcasterConfig(data: ConfigData | any);
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
  getBroadcasterConfig(): ConfigResponse {
    let data = localStorage.getItem("src-twitch-ext");
    if (data === null) {
      return <ConfigResponse>{
        data: undefined,
        configInvalid: false,
        error: undefined,
      };
    }
    try {
      let config: TwitchConfigObject = JSON.parse(data);
      if (!("broadcaster" in config) || config.broadcaster === undefined) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Retrieved invalid configuration",
        };
      }
      let parsedData = JSON.parse(config.broadcaster.content);
      if (!isValidConfigData(parsedData)) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Retrieved invalid configuration",
        };
      }
      return <ConfigResponse>{
        data: parsedData,
        configInvalid: false,
        error: undefined,
      };
    } catch (e) {
      return <ConfigResponse>{
        data: undefined,
        configInvalid: true,
        error: "Retrieved invalid configuration",
      };
    }
  }
  getDeveloperConfig() {
    throw new Error("Method not implemented.");
  }
  setBroadcasterConfig(data: ConfigData) {
    let config: TwitchConfigObject;
    if (localStorage.getItem("src-twitch-ext") === null) {
      config = {
        broadcaster: {
          version: "1.0",
          content: JSON.stringify(data),
        },
      };
    } else {
      config = JSON.parse(localStorage.getItem("src-twitch-ext"));
      config.broadcaster = {
        version: "1.0",
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
  getBroadcasterConfig(): ConfigResponse {
    try {
      let parsedData = JSON.parse(
        this.windowInstance.Twitch.ext.configuration.broadcaster.content,
      );
      if (!isValidConfigData(parsedData)) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Invalid configuration found",
        };
      }
      return <ConfigResponse>{
        data: parsedData,
        configInvalid: false,
        error: undefined,
      };
    } catch (e) {
      return <ConfigResponse>{
        data: undefined,
        configInvalid: true,
        error: "Invalid configuration found",
      };
    }
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
