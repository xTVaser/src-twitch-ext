// TODO - not yet supported:
// - miscellaneous subcategories (seems to be a thing...)

import { log } from "./logging";

export interface SpeedrunComError {
  errorMessage: string;
}

export interface SpeedrunComUser {
  id: string;
  name: string;
}

export async function lookupUserByName(
  srcUserName: string,
): Promise<SpeedrunComUser | SpeedrunComError> {
  const url = `https://www.speedrun.com/api/v1/users?lookup=${srcUserName}`;
  let userData = [];
  try {
    let resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`HTTP error! Status: ${resp.status}`);
    }
    userData = (await resp.json()).data;
  } catch (error) {
    log(`Caught an error: ${error}`);
    return <SpeedrunComError>{
      errorMessage:
        "Unexpected error occurred when looking up the Speedrun.com user",
    };
  }

  if (userData.length == 0) {
    return <SpeedrunComError>{
      errorMessage: "Found no users with that name",
    };
  }
  if (userData.length > 1) {
    return <SpeedrunComError>{
      errorMessage: "Found too many users with that name",
    };
  }

  const userMeta = userData[0];
  return <SpeedrunComUser>{
    id: userMeta.id,
    name: userMeta.names.international,
  };
}

export interface SubcategoryInfo {
  srcVariableId: string;
  srcVariableValueId: string;
  srcVariableValueVal: string;
}

export class PersonalBest {
  constructor(
    public srcGameId: string,
    public srcGameName: string,
    public srcGameCoverUrl: string | undefined,
    public srcGameUrl: string,
    public srcRunId: string,
    public srcRunUrl: string,
    public srcRunTime: number,
    public srcRunDate: Date,
    public srcLeaderboardPlace: number,
    public srcCategoryId: string | undefined,
    public srcCategoryName: string | undefined,
    public srcIsMiscCategory: boolean,
    public srcLevelId: string | undefined,
    public srcLevelName: string | undefined,
    public isLevel: boolean,
    public hasSubcategories: boolean,
    public subcategoryInfo: SubcategoryInfo[],
  ) {}

  public getId(): string {
    // This ID should be unique for each category-etc combination
    // it is used to join the user's saved data with the data pulled down from SRC (live data)
    //
    // Normally this could be done with just the runID -- but the idea of the extension is to
    // remove the need to update everytime you get a new run
    let id = `${this.srcGameId}-${this.srcCategoryId}`;
    if (isLevel) {
      id += `-${this.srcLevelId}`;
    }
    // Subcategories are annoying because they are are not returned in a manner that can be trusted
    // for purposes like this (in the same order)
    //
    // Therefore, we sort them ourselves first by the variable ids
    if (hasSubcategories) {
      let variableTuples = [];
      this.subcategoryInfo.forEach((info) => {
        variableTuples.push(`${info.srcVariableId}-${info.srcVariableValueId}`);
      });
      variableTuples.sort();
      id += `-${variableTuples.join("-")}`;
    }
    return id;
  }

  public getCategoryOrLevelName(): string {
    let name = "";
    if (this.isLevel) {
      name = `${this.srcLevelName} - ${this.srcCategoryName}`;
    } else {
      name = this.srcCategoryName;
    }

    // Append subcategories - sort them to get things consistent
    if (this.hasSubcategories) {
      let variableValues = [];
      this.subcategoryInfo.forEach((info) => {
        variableValues.push(info.srcVariableValueVal);
      });
      variableValues.sort();
      if (variableValues.length > 0) {
        name += ` - ${variableValues.join(" - ")}`;
      }
    }
    return name;
  }
}

function isLevel(pbData: any) {
  // SRC Issue - 'data' is normally an object, but when it is absent it's an array? strange, bunch of checks to make this resilient
  // https://github.com/speedruncomorg/api/issues/64
  if (
    !("level" in pbData) ||
    (Array.isArray(pbData.level.data) && pbData.level.data.length === 0) ||
    (typeof pbData.level.data === "object" &&
      !Array.isArray(pbData.level.data) &&
      Object.keys(pbData.level.data).length === 0)
  ) {
    return false;
  }
  return true;
}

function hasSubcategories(pbData: any) {
  // Get all the variables from the run
  let runValues = pbData.run.values;
  if (Object.keys(runValues).length === 0) {
    return false;
  }

  // Check to see if any are a subcategory
  if ("variables" in pbData.category.data) {
    for (const variable of pbData.category.data.variables.data) {
      if (variable["is-subcategory"] && variable.id in runValues) {
        return true;
      }
    }
  }
  return false;
}

function getSubcategories(pbData: any) {
  // Get all the variables from the run
  let runValues = pbData.run.values;
  if (Object.keys(runValues).length === 0) {
    return [];
  }

  let subcategories: SubcategoryInfo[] = [];

  // Check to see if any are a subcategory
  if ("variables" in pbData.category.data) {
    for (const variable of pbData.category.data.variables.data) {
      if (variable["is-subcategory"] && variable.id in runValues) {
        subcategories.push(<SubcategoryInfo>{
          srcVariableId: variable.id,
          srcVariableValueId: runValues[variable.id],
          srcVariableValueVal:
            variable.values.values[runValues[variable.id]].label,
        });
      }
    }
  }
  return subcategories;
}

async function retrievePersonalBests(
  url: string,
  personalBests: Map<string, PersonalBest>,
): Promise<SpeedrunComError | string | undefined> {
  try {
    let resp = await fetch(url);
    if (!resp.ok) {
      return <SpeedrunComError>{
        errorMessage: `Unexpected error when retrieving Personal Best data from Speedrun.com. Status: ${resp.status}`,
      };
    }
    let pbData = (await resp.json()).data;
    for (const pb of pbData) {
      let newEntry = new PersonalBest(
        pb.game.data.id,
        pb.game.data.names.international,
        "cover-tiny" in pb.game.data.assets
          ? pb.game.data.assets["cover-tiny"].uri
          : undefined,
        pb.game.data.weblink,
        pb.run.id,
        pb.run.weblink,
        pb.run.times.primary_t,
        new Date(pb.run.date),
        pb.place,
        pb.category.data.id,
        pb.category.data.name,
        pb.category.data.miscellaneous,
        isLevel(pb) ? pb.level.data.id : undefined,
        isLevel(pb) ? pb.level.data.name : undefined,
        isLevel(pb),
        hasSubcategories(pb),
        getSubcategories(pb),
      );

      // Add only the first PB entry for a given category
      const entryId = newEntry.getId();
      if (!personalBests.has(entryId)) {
        personalBests.set(entryId, newEntry);
      }
    }

    if (
      "pagination" in Object.keys(pbData) &&
      "links" in Object.keys(pbData.pagination)
    ) {
      // Find the "next" link, for some reason it's not a map
      for (const link of pbData.pagination.links) {
        if (link.rel === "next") {
          return link.uri;
        }
      }
    }
    return undefined;
  } catch (error) {
    log(`unexpected error when hitting speedrun.com's API ${error}`);
    return <SpeedrunComError>{
      errorMessage:
        "Unexpected error when retrieving Personal Best data from Speedrun.com",
    };
  }
}

export async function getUsersPersonalBests(
  srcUserId: string,
): Promise<Map<string, PersonalBest> | SpeedrunComError> {
  // https://www.speedrun.com/api/v1/users/e8envo80/personal-bests?embed=game,category.variables,level.variables&max=200
  let url = `https://www.speedrun.com/api/v1/users/${srcUserId}/personal-bests?embed=game,category.variables,level.variables&max=200`;
  let personalBests = new Map<string, PersonalBest>();
  // SRC Issue - doesn't even support pagination https://github.com/speedruncomorg/api/issues/170
  while (true) {
    const result = await retrievePersonalBests(url, personalBests);
    if (result === undefined) {
      break;
    } else if (typeof result === "string") {
      url = result;
    } else {
      return result;
    }
  }
  return personalBests;
}

export interface UserGameData {
  id: string;
  name: string;
}

export async function getUsersGamesFromPersonalBests(
  srcUserId: string,
): Promise<UserGameData[] | SpeedrunComError> {
  const personalBests = await getUsersPersonalBests(srcUserId);
  if ("errorMessage" in personalBests) {
    return personalBests;
  }
  // Extract just the gameIds
  let gameIds = new Set<string>();
  let gameDataList = [];
  for (const [dataId, pb] of personalBests) {
    if (!gameIds.has(pb.srcGameId)) {
      gameDataList.push({
        id: pb.srcGameId,
        name: pb.srcGameName,
      });
      gameIds.add(pb.srcGameId);
    }
  }
  return gameDataList;
}
