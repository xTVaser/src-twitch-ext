/// Common Functions

// TODO - all fetches should go into a function that handles backoff and retry
async function getPersonalBests(srcID, trackedGames, personalBests, bypassFilter = false) {
    var response = await fetch(`https://www.speedrun.com/api/v1/users/${srcID}/personal-bests?embed=game,category.variables,level.variables`);
    // TODO - currently assuming the request was successful, should detect problems with SRC's API
    var pbData = (await response.json()).data;

    for (var i = 0; i < pbData.length; i++) {
        game = pbData[i].game.data;
        run = pbData[i].run;
        category = pbData[i].category.data;
        level = pbData[i].level.data;

        // Check that this is one of the games the user wants tracked
        if (!bypassFilter) {
            // TODO - filter this outside the loop
            index = trackedGames.findIndex(x => x.id === run.game);
            if (index <= -1) {
                continue;
            }
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

        personalBests[run.game].push({
            gameId: run.game, // laziness, but with good intentions
            // TODO - added, this shouldnt cause problems but...yet to see for sure
            gameName: game.names.international,
            categoryID: run.category,
            categoryName: category.name,
            // BUG - workaround for SRC bug
            categoryLink: (run.level == null) ? category.weblink : `${level.weblink}#${category.name}`,
            subcategoryName: subcategoryName,
            subcategoryID: subcategoryID, // may not exist, will leave null if that is the case
            subcategoryVal: subcategoryVal, // may not exist, will leave null if that is the case
            levelID: run.level, // will be null if not a level
            levelName: level.name,
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

/// Viewer-Only functions

// TODO - may move this into the above function

// TODO - Not checking to see how many categories a level has to reduce API calls
// previously we'd investigate to see if a level only had 1 category, if so we'd hide it
// however this really isnt' worth encuring the cost.  If we really want this, perhaps we can query each _game_ once rather than each level
// This could be a toggable option, I'm imagining most leaderboards have multiple categories anyway
async function resolveSubcategoryNames(personalBests) {
    gameIDs = Object.keys(personalBests);
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < personalBests[gameIDs[i]].length; j++) {
            currentPBEntry = personalBests[gameIDs[i]][j];
            // TODO - this should probably be done in templating later rather than overwriting values here
            if (currentPBEntry.isLevel) {
                // NOTE - I deleted API calls here despite the SRC API issue, this should be fine and I work-around this small issue above
                // BUG - bug in category embed, weblink = game URL for levels
                if (currentPBEntry.categoryName != "") {
                    currentPBEntry.categoryName = `${currentPBEntry.levelName} - ${currentPBEntry.categoryName}`;
                } else {
                    currentPBEntry.categoryName = currentPBEntry.levelName;
                }
                if (currentPBEntry.subcategoryName != "") {
                    currentPBEntry.categoryName += ` - ${currentPBEntry.subcategoryName}`;
                }
            }
            // TODO - this should probably be done in templating later rather than overwriting values here
            else if (currentPBEntry.subcategoryName != "") {
                // just append the subcategory
                currentPBEntry.categoryName += " - " + currentPBEntry.subcategoryName;
            }
        }
    }
}

// TODO - If Speedrun.com ever allows you to get the top runs on more than 1 category/level, then this doesn't have to be a million requests
async function getWorldRecords(personalBests) {
    reqs = [];
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
            reqs.push(examineWorldRecordEntry(requestURL, currentPBEntry));
        }
    }
    await Promise.all(reqs);
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

// TODO - docstring functions

/// Configuration-Only Functions

async function lookupSpeedrunner(name) {
    var response = await fetch(`https://www.speedrun.com/api/v1/users?lookup=${name}`);
    return (await response.json()).data;
}