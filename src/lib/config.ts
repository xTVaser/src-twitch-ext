import { z } from "zod";
import { gzipSync, gunzipSync } from "fflate";
import { Buffer } from "buffer";

interface ThemeDataMinified {
  // defaultTheme
  d: boolean;
  // hideExpandIcon
  e: boolean;
  // showRainbowWorldRecord
  r: boolean;
  // showPlace
  p: boolean;
  // mainBackgroundColor
  mbgc: string;
  // gameHeaderBackgroundColor
  ghbgc: string;
  // gameEntriesBackgroundColor
  gebgc: string;
  // gameEntriesAlternateRowColor
  gearc: string;
  // gameNameLinkHoverColor
  gnlhc: string;
  // gameEntryLinkHoverColor
  gelhc: string;
  // gameEntryLeaderboardPlaceColor
  gelpc: string;
  // gameExpandIconColor
  geic: string;
  // gameNameFontColor
  gnfc: string;
  // gameNameSubheaderFontColor
  gnsfc: string;
  // gameEntryFontColor
  gefc: string;
  // gameEntryTimeFontColor
  getfc: string;
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
  gameEntryLeaderboardPlaceColor: string;
  // Fonts
  gameNameFontColor: string;
  gameNameSubheaderFontColor: string;
  gameEntryFontColor: string;
  gameEntryTimeFontColor: string;
}

function minifyThemeData(themeData: ThemeData): ThemeDataMinified {
  return {
    d: themeData.defaultTheme,
    e: themeData.hideExpandIcon,
    r: themeData.showRainbowWorldRecord,
    p: themeData.showPlace,
    mbgc: themeData.mainBackgroundColor,
    ghbgc: themeData.gameHeaderBackgroundColor,
    gebgc: themeData.gameEntriesBackgroundColor,
    gearc: themeData.gameEntriesAlternateRowColor,
    gnlhc: themeData.gameNameLinkHoverColor,
    gelhc: themeData.gameEntryLinkHoverColor,
    geic: themeData.gameExpandIconColor,
    gelpc: themeData.gameEntryLeaderboardPlaceColor,
    gnfc: themeData.gameNameFontColor,
    gnsfc: themeData.gameNameSubheaderFontColor,
    gefc: themeData.gameEntryFontColor,
    getfc: themeData.gameEntryTimeFontColor,
  };
}

function parseMinifiedThemeData(
  themeDataMinfied: ThemeDataMinified,
): ThemeData {
  return {
    defaultTheme: themeDataMinfied.d,
    hideExpandIcon: themeDataMinfied.e,
    showRainbowWorldRecord: themeDataMinfied.r,
    showPlace: themeDataMinfied.p,
    mainBackgroundColor: themeDataMinfied.mbgc,
    gameHeaderBackgroundColor: themeDataMinfied.ghbgc,
    gameEntriesBackgroundColor: themeDataMinfied.gebgc,
    gameEntriesAlternateRowColor: themeDataMinfied.gearc,
    gameNameLinkHoverColor: themeDataMinfied.gnlhc,
    gameEntryLinkHoverColor: themeDataMinfied.gelhc,
    gameExpandIconColor: themeDataMinfied.geic,
    gameEntryLeaderboardPlaceColor: themeDataMinfied.gelpc,
    gameNameFontColor: themeDataMinfied.gnfc,
    gameNameSubheaderFontColor: themeDataMinfied.gnsfc,
    gameEntryFontColor: themeDataMinfied.gefc,
    gameEntryTimeFontColor: themeDataMinfied.getfc,
  };
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
  document.documentElement.style.setProperty(
    `--src-twitch-ext-color-gameEntryLeaderboardPlace`,
    themeData.gameEntryLeaderboardPlaceColor,
  );
}

export const DefaultDarkTheme: ThemeData = {
  defaultTheme: true,
  hideExpandIcon: false,
  showRainbowWorldRecord: true,
  showPlace: false,
  mainBackgroundColor: "#212026",
  gameHeaderBackgroundColor: "#322f37",
  gameEntriesBackgroundColor: "#212026",
  gameEntriesAlternateRowColor: "#111113",
  gameNameLinkHoverColor: "#a06bff",
  gameEntryLinkHoverColor: "#a06bff",
  gameExpandIconColor: "#dfdde2",
  gameEntryLeaderboardPlaceColor: "#808080",
  gameNameFontColor: "#dfdde2",
  gameNameSubheaderFontColor: "#a299b0",
  gameEntryFontColor: "#ffffff",
  gameEntryTimeFontColor: "#ffffff",
};

export function getDefaultTheme(themeName: string | undefined): ThemeData {
  if (themeName === `_default-dark`) {
    return DefaultDarkTheme;
  }
  return DefaultDarkTheme;
}

export interface GameConfigData {
  userSrcId: string | null;
  userSrcName: string | null;
  // src game ids
  disabledGames: string[];
  gameSorting: "recent" | "num" | "alpha";
  entrySorting: "recent" | "alpha" | "place";
  groupLevelsSeparately: boolean;
}

interface GameConfigDataMinified {
  // userSrcId
  si: string;
  // userSrcName
  sn: string;
  // disabledGames
  d: string[];
  // gameSorting
  gs: "recent" | "num" | "alpha";
  // entrySorting
  es: "recent" | "alpha" | "place";
  // groupLevelsSeparately
  gl: boolean;
}

interface ConfigDataMinified {
  // version
  v: string;
  // gameData
  g: GameConfigDataMinified;
  // currentThemeName
  tn: string;
  // customThemes
  td: Record<string, ThemeDataMinified>;
}

export class ConfigData {
  version: string = "1.0";
  gameData: GameConfigData = {
    userSrcId: null,
    userSrcName: null,
    disabledGames: [],
    gameSorting: "recent",
    entrySorting: "recent",
    groupLevelsSeparately: true,
  };
  currentThemeName: string = "_default-dark";
  customThemes: Record<string, ThemeData> = {};

  minify(): ConfigDataMinified {
    let themeDataMinified = {};
    for (const [themeName, themeData] of Object.entries(this.customThemes)) {
      themeDataMinified[themeName] = minifyThemeData(themeData);
    }
    const ye = {
      v: this.version,
      g: {
        si: this.gameData.userSrcId,
        sn: this.gameData.userSrcName,
        d: this.gameData.disabledGames,
        gs: this.gameData.gameSorting,
        es: this.gameData.entrySorting,
        gl: this.gameData.groupLevelsSeparately,
      },
      tn: this.currentThemeName,
      td: themeDataMinified,
    };
    return ye;
  }

  static parse(jsonData: ConfigDataMinified): ConfigData {
    const configData = new ConfigData();
    configData.version = jsonData.v;
    configData.gameData.userSrcId = jsonData.g.si;
    configData.gameData.userSrcName = jsonData.g.sn;
    configData.gameData.disabledGames = jsonData.g.d;
    configData.gameData.gameSorting = jsonData.g.gs;
    configData.gameData.entrySorting = jsonData.g.es;
    configData.gameData.groupLevelsSeparately = jsonData.g.gl;
    configData.currentThemeName = jsonData.tn;
    for (const [themeName, themeData] of Object.entries(jsonData.td)) {
      configData.customThemes[themeName] = parseMinifiedThemeData(themeData);
    }
    return configData;
  }
}

const ConfigDataSchemaV1 = z.object({
  v: z.string(),
  g: z.object({
    si: z.nullable(z.string()),
    sn: z.nullable(z.string()),
    d: z.array(z.string()),
    gs: z.enum(["recent", "num", "alpha"]),
    es: z.enum(["recent", "alpha", "place"]),
    gl: z.boolean(),
  }),
  tn: z.string(),
  td: z.record(
    z.string(),
    z.object({
      d: z.boolean(),
      e: z.boolean(),
      gearc: z.string(),
      gebgc: z.string(),
      gefc: z.string(),
      geic: z.string(),
      gelhc: z.string(),
      gelpc: z.string(),
      getfc: z.string(),
      ghbgc: z.string(),
      gnfc: z.string(),
      gnlhc: z.string(),
      gnsfc: z.string(),
      mbgc: z.string(),
      p: z.boolean(),
      r: z.boolean(),
    }),
  ),
});

function isValidConfigData(jsonData: any): boolean {
  try {
    ConfigDataSchemaV1.parse(jsonData);
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
  abstract setBroadcasterConfig(data: ConfigData): string | undefined;
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
      // Decompress the data
      let config: TwitchConfigObject = JSON.parse(data);
      if (!("broadcaster" in config) || config.broadcaster === undefined) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Retrieved invalid configuration",
        };
      }
      const decompressedData = Buffer.from(
        gunzipSync(Buffer.from(config.broadcaster.content, "base64")).buffer,
      ).toString();
      let parsedData = JSON.parse(decompressedData);
      if (!isValidConfigData(parsedData)) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Retrieved invalid configuration",
        };
      }
      return <ConfigResponse>{
        data: ConfigData.parse(parsedData),
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
  setBroadcasterConfig(data: ConfigData): string | undefined {
    let config: TwitchConfigObject;
    const compressedData = gzipSync(Buffer.from(JSON.stringify(data.minify())));
    if (localStorage.getItem("src-twitch-ext") === null) {
      config = {
        broadcaster: {
          version: "1.0",
          content: Buffer.from(compressedData.buffer).toString("base64"),
        },
      };
    } else {
      config = JSON.parse(localStorage.getItem("src-twitch-ext"));
      config.broadcaster = {
        version: "1.0",
        content: Buffer.from(compressedData.buffer).toString("base64"),
      };
    }
    localStorage.setItem("src-twitch-ext", JSON.stringify(config));
    return undefined;
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
      const decompressedData = Buffer.from(
        gunzipSync(
          Buffer.from(
            this.windowInstance.Twitch.ext.configuration.broadcaster.content,
            "base64",
          ),
        ).buffer,
      ).toString();
      let parsedData = JSON.parse(decompressedData);
      if (!isValidConfigData(parsedData)) {
        return <ConfigResponse>{
          data: undefined,
          configInvalid: true,
          error: "Invalid configuration found",
        };
      }
      return <ConfigResponse>{
        data: ConfigData.parse(parsedData),
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
  setBroadcasterConfig(data: ConfigData): string | undefined {
    try {
      const compressedData = gzipSync(
        Buffer.from(JSON.stringify(data.minify())),
      );
      this.windowInstance.Twitch.ext.configuration.set(
        "broadcaster",
        "1.0",
        Buffer.from(compressedData.buffer).toString("base64"),
      );
    } catch (e) {
      return `Unable to set broadcaster configuration: ${e}`;
    }
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
