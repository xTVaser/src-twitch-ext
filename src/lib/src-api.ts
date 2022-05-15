// TODO - not yet supported:
// - miscellaneous subcategories

export interface SpeedrunComUser {
  id: string;
  name: string;
}

export interface SubcategoryInfo {
  srcVariableId: string;
  srcVariableValueId: string;
  srcVariableValueVal: string;
}

export interface PersonalBest {
  srcRunId: string;
  srcCategoryId: string | undefined;
  srcCategoryName: string | undefined;
  srcIsMiscCategory: boolean;
  srcLevelId: string | undefined;
  srcLevelName: string | undefined;
  isLevel: boolean;
  hasSubcategories: boolean;
  subcategoryInfo: SubcategoryInfo[];
}

export class PersonalBestCollection {
  srcGameId: string;
  srcGameName: string;
  entries: PersonalBest[] = [];
}

export async function lookupUserByName(
  srcUserName: string
): Promise<SpeedrunComUser> {
  const url = `https://www.speedrun.com/api/v1/users?lookup=${srcUserName}`;
  let userData = [];
  try {
    let resp = await fetch(url);
    userData = (await resp.json()).data;
  } catch (error) {
    throw new Error(
      "src: Unexpected error occurred when looking up the Speedrun.com User"
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

function isLevel(pbData: any) {
  // SRC - 'data' is normally an object, but when it is absent it's an array? strange
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
  srcUserId: string
): Promise<PersonalBestCollection[]> {
  // https://www.speedrun.com/api/v1/users/e8envo80/personal-bests?embed=category.variables,level.variables&max=200
  const url = `https://www.speedrun.com/api/v1/users/${srcUserId}/personal-bests?embed=game,category.variables,level.variables&max=200`;
  let personalBests = new Map<string, PersonalBestCollection>();
  let pbData = [];
  let pbBuckets = new Map<string, any>();

  try {
    let resp = await fetch(url);
    pbData = (await resp.json()).data;

    // TODO - pagination
    for (const pb of pbData) {
      const gameId = pb.game.data.id;
      if (!personalBests.has(gameId)) {
        let newColl = new PersonalBestCollection();
        newColl.srcGameId = gameId;
        newColl.srcGameName = pb.game.data.names.international;
        personalBests.set(newColl.srcGameId, newColl);
        pbBuckets.set(newColl.srcGameId, {
          normalCategories: {
            main: [],
            misc: [],
          },
          individualLevels: {
            main: [],
            misc: [],
          },
        });
      }

      let newEntry = <PersonalBest>{
        srcRunId: pb.run.id,
        srcCategoryId: pb.category.data.id,
        srcCategoryName: pb.category.data.name,
        srcIsMiscCategory: pb.category.data.miscellaneous,
        srcLevelId: isLevel(pb) ? pb.level.data.id : undefined,
        srcLevelName: isLevel(pb) ? pb.level.data.name : undefined,
        isLevel: isLevel(pb),
        hasSubcategories: hasSubcategories(pb),
        subcategoryInfo: getSubcategories(pb),
      };

      if (newEntry.isLevel) {
        if (newEntry.srcIsMiscCategory) {
          pbBuckets.get(gameId).individualLevels.misc.push(newEntry);
        } else {
          pbBuckets.get(gameId).individualLevels.main.push(newEntry);
        }
      } else {
        if (newEntry.srcIsMiscCategory) {
          pbBuckets.get(gameId).normalCategories.misc.push(newEntry);
        } else {
          pbBuckets.get(gameId).normalCategories.main.push(newEntry);
        }
      }
    }
  } catch (error) {
    // TODO - logging and such
    console.log(error);
    return [];
  }

  // Sort by names
  for (const [gameId, data] of pbBuckets.entries()) {
    data.normalCategories.main.sort((a, b) =>
      resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
    );
    data.normalCategories.misc.sort((a, b) =>
      resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
    );
    data.individualLevels.main.sort((a, b) =>
      resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
    );
    data.individualLevels.misc.sort((a, b) =>
      resolveLevelOrCategoryName(a).localeCompare(resolveLevelOrCategoryName(b))
    );
    // Combine the buckets into the collections
    personalBests.get(gameId).entries = data.normalCategories.main.concat(
      data.normalCategories.misc,
      data.individualLevels.main,
      data.individualLevels.misc
    );
  }

  return Array.from(personalBests.values());
}
