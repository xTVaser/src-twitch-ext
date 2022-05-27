import type { PersonalBest } from "./src-api";

class GameDataGeneralSettings {
  showWorldRecord: boolean = false;
  showRainbowWorldRecord: boolean = false;
  showMilliseconds: boolean = false;
  showSeconds: boolean = true;
}

class GameDataEntrySettings {
  dataId: string; // The ID used to join with live data
  isDisabled: boolean = false;
  titleTemplateOverride: string = undefined;
}

class GameDataGamesSettings {
  public isDisabled: boolean = false;
  public overrideDefaults: boolean = false;
  public showMilliseconds: boolean = false;
  public showSeconds: boolean = true;
  public titleTemplateOverride: string = undefined;
  public autoExpanded: boolean = false;
  public entries: GameDataEntrySettings[] = [];
  constructor(public srcId: string, public title: string) {}
}

export class GameData {
  userSrcId: string;
  userSrcName: string;
  general: GameDataGeneralSettings;
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
      game.entries.push(<GameDataEntrySettings>{
        dataId: dataId,
      });
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
