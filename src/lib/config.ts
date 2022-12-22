import type { PersonalBest } from "./src-api";

class GameDataEntrySettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public titleOverride: string = undefined;
  // The ID used to join with live data
  constructor(public dataId: string) {}
}

class GameDataGamesSettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public showMilliseconds: boolean = false;
  public showSeconds: boolean = true;
  public titleOverride: string = undefined;
  public autoExpanded: boolean = false;
  public entries: GameDataEntrySettings[] = [];
  constructor(public srcId: string, public title: string) {}
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

export class ThemeFontSettings {
  public bold: boolean;
  public italic: boolean;
  public color: string;
  public family: string; // TODO - enum of supported fonts?

  public updateCSSVars(suffix: string) {
    document.documentElement.style.setProperty(
      `src-twitch-ext-font-weight-${suffix}`,
      this.bold ? "700" : "400"
    );
    document.documentElement.style.setProperty(
      `src-twitch-ext-font-style-${suffix}`,
      this.italic ? "oblique" : "normal"
    );
    document.documentElement.style.setProperty(
      `src-twitch-ext-font-color-${suffix}`,
      this.color
    );
    document.documentElement.style.setProperty(
      `src-twitch-ext-font-family-${suffix}`,
      this.family
    );
  }
}

export class ThemeData {
  // Flags
  public hideExpandIcon: boolean;
  public showRainbowWorldRecord: boolean;
  public showWorldRecord: boolean;
  // Colors
  public mainBackgroundColor: string;
  public gameHeaderBackgroundColor: string;
  public gameEntriesBackgroundColor: string;
  public gameEntriesAlternateRowColor: string;
  public gameNameLinkHoverColor: string;
  public gameEntryLinkHoverColor: string;
  public gameExpandIconColor: string;
  // Fonts
  public gameNameFont: ThemeFontSettings;
  public gameNameSubheaderFont: ThemeFontSettings;
  public gameEntryFont: ThemeFontSettings;
  public gameEntryTimeFont: ThemeFontSettings;

  public updateCSSVars() {
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-mainBackground`,
      this.mainBackgroundColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameHeaderBackground`,
      this.gameHeaderBackgroundColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameEntriesBackground`,
      this.gameEntriesBackgroundColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameEntriesAlternateRow`,
      this.gameEntriesAlternateRowColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameNameLinkHover`,
      this.gameNameLinkHoverColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameEntryLinkHover`,
      this.gameEntryLinkHoverColor
    );
    document.documentElement.style.setProperty(
      `--src-twitch-ext-color-gameExpandIcon`,
      this.gameExpandIconColor
    );
    this.gameNameFont.updateCSSVars("gameName");
    this.gameNameSubheaderFont.updateCSSVars("gameNameSubheader");
    this.gameEntryFont.updateCSSVars("gameEntry");
    this.gameEntryTimeFont.updateCSSVars("gameEntryTime");
  }
}

export class ConfigData {
  gameData: GameData = new GameData();
  currentTheme: ThemeData = new ThemeData();
  savedThemes: ThemeData[] = [];
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
        localStorage.getItem("src-twitch-ext")
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
      this.windowInstance.Twitch.ext.configuration.broadcaster.content
    );
  }
  setBroadcasterConfig(data: any) {
    this.windowInstance.Twitch.ext.configuration.set(
      "broadcaster",
      "1.0",
      JSON.stringify(data)
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
