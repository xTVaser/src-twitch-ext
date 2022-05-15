import type { PersonalBestCollection, SubcategoryInfo } from "./src-api";

class GameDataGeneralSettings {
  showWorldRecord: boolean = true;
  showRainbowWorldRecord: boolean = true;
  showMilliseconds: boolean = false;
  showSeconds: boolean = true;
}

class GameDataEntrySettings {
  srcCategoryName: string;
  srcLevelName: string;
  hasSubcategories: boolean = false;
  srcSubcategoryInfo: SubcategoryInfo[] = [];
  isLevel: boolean = false;
  isMisc: boolean = false;
  isDisabled: boolean = false;
  titleTemplateOverride: string = undefined;
}

class GameDataGamesSettings {
  srcId: string;
  title: string;
  isDisabled: boolean = false;
  overrideDefaults: boolean = false;
  showMilliseconds: boolean = false;
  showSeconds: boolean = true;
  titleTemplateOverride: string = undefined;
  entries: GameDataEntrySettings[] = [];
}

export class GameData {
  srcId: string;
  srcName: string;
  general: GameDataGeneralSettings;
  games: GameDataGamesSettings[] = [];

  static initFromPersonalBestData(data: PersonalBestCollection[]): GameData {
    let newGameData = new GameData();
    for (const game of data) {
      let newGame = <GameDataGamesSettings>{
        srcId: game.srcGameId,
        title: game.srcGameName,
        entries: [],
      };
      for (const entry of game.entries) {
        newGame.entries.push(<GameDataEntrySettings>{
          srcCategoryName: entry.srcCategoryName,
          srcLevelName: entry.srcLevelName,
          hasSubcategories: entry.hasSubcategories,
          srcSubcategoryInfo: entry.subcategoryInfo,
          isLevel: entry.isLevel,
          isMisc: entry.srcIsMiscCategory,
        });
      }
      newGameData.games.push(newGame);
    }
    return newGameData;
  }
}

class ThemeData {}

export class ConfigData {
  gameData: GameData = new GameData();
  currentTheme: ThemeData = new ThemeData();
  savedThemes: ThemeData[];
}

abstract class ConfigService {
  abstract developerConfigExists(): boolean;
  abstract getBroadcasterConfig(): ConfigData;
  abstract getDeveloperConfig(): any;
  abstract setBroadcasterConfig(data: ConfigData);
  abstract setDeveloperConfig(data: any);
}

export class LocalConfigService extends ConfigService {
  developerConfigExists(): boolean {
    return localStorage.getItem("src-twitch-ext") !== null;
  }
  getBroadcasterConfig(): ConfigData {
    return JSON.parse(localStorage.getItem("src-twitch-ext"));
  }
  getDeveloperConfig() {
    throw new Error("Method not implemented.");
  }
  setBroadcasterConfig(data: ConfigData) {
    localStorage.setItem("src-twitch-ext", JSON.stringify(data));
  }
  setDeveloperConfig(data: any) {
    throw new Error("Method not implemented.");
  }
}

export class TwitchConfigService extends ConfigService {
  developerConfigExists(): boolean {
    throw new Error("Method not implemented.");
  }
  getBroadcasterConfig(): ConfigData {
    throw new Error("Method not implemented.");
  }
  getDeveloperConfig() {
    throw new Error("Method not implemented.");
  }
  setBroadcasterConfig(data: any) {
    throw new Error("Method not implemented.");
  }
  setDeveloperConfig(data: any) {
    throw new Error("Method not implemented.");
  }
}
