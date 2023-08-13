// TODO - not yet supported:
// - miscellaneous subcategories (seems to be a thing...)
// TODO - storing "undefined" in the dataId (might be intentional)

import { log } from "./logging";

export interface SpeedrunComUser {
  id: string;
  name: string;
}

export async function lookupUserByName(
  srcUserName: string,
): Promise<SpeedrunComUser> {
  const url = `https://www.speedrun.com/api/v1/users?lookup=${srcUserName}`;
  let userData = [];
  try {
    let resp = await fetch(url);
    userData = (await resp.json()).data;
  } catch (error) {
    throw new Error(
      "src: Unexpected error occurred when looking up the Speedrun.com User",
    );
  }

  if (userData.length == 0) {
    throw new Error("src: Found no users with that name");
  }
  if (userData.length > 1) {
    throw new Error("src: Found too many users with that name");
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
    public srcGameCoverUrl: string,
    public srcGameUrl: string,
    public srcRunId: string,
    public srcRunUrl: string,
    public srcRunTime: number,
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
  // SRC Issue - 'data' is normally an object, but when it is absent it's an array? strange
  if (!("level" in pbData) || pbData.level.data.length === 0) {
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
  // TODO - probably a RTE if there are no variables
  for (const variable of pbData.category.data.variables.data) {
    if (variable["is-subcategory"] && variable.id in runValues) {
      return true;
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
  // TODO - probably a RTE if there are no variables
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
  return subcategories;
}

function resolveSubcategoryName(pb: PersonalBest): string {
  // The order from SRC is probably somewhat deterministic, but i can't rely on it
  // lexiographically sort
  if (pb.hasSubcategories) {
    return ` - ${pb.subcategoryInfo
      .map((elem) => elem.srcVariableValueVal)
      .join(" - ")}`;
  }
  return "";
}

function resolveLevelOrCategoryName(pb: PersonalBest): string {
  if (pb.isLevel) {
    return `${pb.srcLevelName}${resolveSubcategoryName(pb)}`;
  }
  return `${pb.srcCategoryName}${resolveSubcategoryName(pb)}`;
}

export async function getUsersPersonalBests(
  srcUserId: string,
): Promise<Map<string, PersonalBest> | undefined> {
  // https://www.speedrun.com/api/v1/users/e8envo80/personal-bests?embed=game,category.variables,level.variables&max=200
  const url = `https://www.speedrun.com/api/v1/users/${srcUserId}/personal-bests?embed=game,category.variables,level.variables&max=200`;
  let personalBests = new Map<string, PersonalBest>();
  let pbData = [];

  try {
    let resp = await fetch(url);
    pbData = (await resp.json()).data;

    // TODO - pagination - check for 'pagination' entry on `resp`
    for (const pb of pbData) {
      let newEntry = new PersonalBest(
        pb.game.data.id,
        pb.game.data.names.international,
        pb.game.data.assets["cover-tiny"].uri,
        pb.game.data.weblink,
        pb.run.id,
        pb.run.weblink,
        pb.run.times.primary_t,
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

      personalBests.set(newEntry.getId(), newEntry);
    }
  } catch (error) {
    log(`unexpected error when hitting speedrun.com's API ${error}`);
    return undefined;
  }

  // Sort by names
  // TODO - not the place to do this, needs to be moved
  // for (const [gameId, data] of pbBuckets.entries()) {
  //   data.normalCategories.main.sort((a, b) =>
  //     resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
  //   );
  //   data.normalCategories.misc.sort((a, b) =>
  //     resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
  //   );
  //   data.individualLevels.main.sort((a, b) =>
  //     resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
  //   );
  //   data.individualLevels.misc.sort((a, b) =>
  //     resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
  //   );
  //   // Combine the buckets into the collections
  //   personalBests.get(gameId).entries = data.normalCategories.main.concat(
  //     data.normalCategories.misc,
  //     data.individualLevels.main,
  //     data.individualLevels.misc
  //   );
  // }

  return personalBests;
}
