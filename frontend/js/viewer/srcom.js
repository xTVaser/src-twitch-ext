// TODO - all fetches should go into a function that handles backoff and retry

async function getPersonalBests(srcID, trackedGames, personalBests) {
    var response = await fetch(`https://www.speedrun.com/api/v1/users/${srcID}/personal-bests?embed=category.variables,level.variables`);
    // TODO - currently assuming the request was successful, should detect problems with SRC's API
    var pbData = (await response.json()).data;

    for (var i = 0; i < pbData.length; i++) {
        run = pbData[i].run;
        category = pbData[i].category.data;
        level = pbData[i].level.data;

        // Check that this is one of the games the user wants tracked
        // TODO - filter this outside the loop
        index = trackedGames.findIndex(x => x.id === run.game);
        if (index <= -1) {
            continue;
        }

        // If this is the first game there, init the index
        if (personalBests[run.game] == null) {
            personalBests[run.game] = new Array()
        }

        // Get the potential subcategory
        // TODO - clarify docs here, unfamiliar
        variables = run.level == null ? category.variables.data : level.variables.data;

        subcategoryID = null
        subcategoryVal = null
        subcategoryName = ""
        for (var j = 0; j < variables.length; j++) {
            if (variables[j]["is-subcategory"] == true &&
                variables[j].id in run.values) {
                // Then its the right subcategory, grab it's label and such
                subcategoryID = variables[j].id
                subcategoryVal = run.values[subcategoryID]

                // Find the value now with the subcategoryVal
                subcategoryName = variables[j].values.values[subcategoryVal].label
            }
        }
        categoryName = run.level == null ? category.name : level.name;

        personalBests[run.game].push({
            gameId: run.game, // laziness, but with good intentions
            categoryID: run.category,
            categoryName: categoryName,
            categoryLink: category.weblink,
            subcategoryName: subcategoryName,
            subcategoryID: subcategoryID, // may not exist, will leave null if that is the case
            subcategoryVal: subcategoryVal, // may not exist, will leave null if that is the case
            levelID: run.level, // will be null if not a level
            levelSubcategoryName: subcategoryName,
            variables: run.values, // We have no guarantee which variables are subcategories or not until we check
            pbTime: run.times.primary_t,
            pbLink: run.weblink,
            wrLink: null,
            wrTime: null,
            isMisc: category.miscellaneous,
            isLevel: run.level != null,
            rank: pbData[i].place
        })
    }
}

// NOTE: this is needed as we want to truncate the category from the name
// if it wasnt, then this step could be avoided with the embed query
async function resolveSubcategoryNames(personalBests) {
    gameIDs = Object.keys(personalBests);
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < personalBests[gameIDs[i]].length; j++) {
            currentPBEntry = personalBests[gameIDs[i]][j];
            if (currentPBEntry.isLevel) {
                // TODO - I believe these API calls can be deleted, although I'd like to wait till I have some unit-tests / functional tests around it before changing
                levelCategoryAPILink = `https://www.speedrun.com/api/v1/levels/${currentPBEntry.levelID}/categories`;
                // TODO - currently not performant, calls should be spawned in parallel and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
                await getLevelCategories(levelCategoryAPILink, currentPBEntry);
            }
            else if (currentPBEntry.subcategoryName != "") {
                // just append the subcategory
                currentPBEntry.categoryName += " - " + currentPBEntry.subcategoryName;
            }
        }
    }
}

// This can probably be done in parallel with getWorldRecords
async function getLevelCategories(url, currentPBEntry) {
    var response = await fetch(url);
    // TODO - currently assuming the request was successful, should detect problems with SRC's API
    var category = (await response.json()).data;
    categories = category
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].id == currentPBEntry.categoryID) {
            category = categories[i]
        }
    }
    // if there is only one category, then we can omit the name
    if (categories.length > 1 && currentPBEntry.subcategoryName != "") {
        currentPBEntry.categoryName += " - " + currentPBEntry.subcategoryName + " - " + category.name
    }
    else if (categories.length > 1 && currentPBEntry.subcategoryName == "") {
        currentPBEntry.categoryName += " - " + category.name
    }
    // overwrite
    currentPBEntry.categoryLink = category.weblink
    currentPBEntry.isMisc = category.miscellaneous
}

async function getWorldRecords(personalBests) {
    gameIDs = Object.keys(personalBests)
    // format for api link                          v if not null v
    //.../gameid/category/categoryid?top=1&var-subcategoryid=subcategoryvalue
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < personalBests[gameIDs[i]].length; j++) {
            currentPBEntry = personalBests[gameIDs[i]][j]
            // Construct API Request
            requestURL = ""
            if (currentPBEntry.isLevel) {
                requestURL = `https://www.speedrun.com/api/v1/leaderboards/${currentPBEntry.gameId}/level/${currentPBEntry.levelID}/${currentPBEntry.categoryID}?top=1`
            }
            else {
                requestURL = `https://www.speedrun.com/api/v1/leaderboards/${currentPBEntry.gameId}/category/${currentPBEntry.categoryID}?top=1`
            }
            if (currentPBEntry.subcategoryID != null) {
                requestURL += `&var-${currentPBEntry.subcategoryID}=${currentPBEntry.subcategoryVal}`
            }
            // TODO - currently not performant, calls should be spawned in parallel and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
            await examineWorldRecordEntry(requestURL, currentPBEntry)
        }
    }
}

async function examineWorldRecordEntry(url, currentPBEntry) {
    var response = await fetch(url);
    // TODO - currently assuming the request was successful, should detect problems with SRC's API
    var worldRecord = (await response.json()).data;
    // Guaranteed to a be wr as we only check categories that streamer has done
    // a run of, which means there is atleast one run
    currentPBEntry.wrLink = worldRecord.runs[0].run.weblink;
    currentPBEntry.wrTime = worldRecord.runs[0].run.times.primary_t;
}