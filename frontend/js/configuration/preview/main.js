/// Javascript to render the personal bests on the channel page
var games
var settings
var srcID
var srcName

var pbList = new Array()

function renderPreview(auth) {

    // Clear the Preview
    pbList = new Array()
    $("#previewHolder").html(
        `<div class="frameWrapper">
            <div class="titleContainer outlineText" style="display: none;"></div>
            <div class="panelTitleDiv" style="display: none;"></div>
            <div class="pbWrapper" style="display: none;"></div>
            <section class="spinnerWrapper">
              <div class="spinner">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div class="spinnerError center">
              </div>
            </section>
        </div>`
    )

    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/fetch",
        headers: {
            'x-extension-jwt': auth.token,
        },
        dataType: "json",
        data: {},
        success: function(res) {
            if (res.hasOwnProperty('data') == true) {
                games = JSON.parse(res.data.games)
                settings = JSON.parse(res.data.settings)
                srcID = res.data.srcID
                srcName = res.data.srcName
                hidePBs = res.data.hidePBs
                // First we will get all the runner's personal bests
                $.ajax({
                    url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests?embed=category.variables,level.variables",
                    dataType: "json",
                    success: function(data) {
                        getPersonalBests(data)
                    }
                });
            } else {
                $('.spinnerError').html('Extension not Configured')
            }
        },
        error: function() {
            $('.spinnerError').html('Extension Error')
        }
    });
}

// TODO redundant now
function getPersonalBestss(json) {
    
    personalBests = json.data
    for (var i = 0; i < personalBests.length; i++) {
        run = personalBests[i].run
        category = personalBests[i].category.data
        level = personalBests[i].level.data
        // If this is one of the games that should be tracked
        index = games.findIndex(x => x.id === run.game)
        if (index > -1) {
            // If this is the first game there, init the spot
            if (pbList[run.game] == null) {
                pbList[run.game] = new Array()
            }
            // Get the potential subcategory
            variables = null
            if (run.level != null) {
                variables = level.variables.data
            }
            else {
                variables = category.variables.data
            }
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
            categoryName = ""
            if (run.level != null) {
                categoryName = level.name
            }
            else {
                categoryName = category.name
            }
            pbList[run.game].push({
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
                rank: personalBests[i].place
            })
        }
    }
    resolveSubcategoryNames()
}

var deferreds = []
function getLevelCategories(url, currentPBEntry) {
    deferreds.push($.getJSON(url, function(json) {
        category = json.data
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
    }))
}

// NOTE: this is needed as we want to truncate the category from the name
// if it wasnt, then this step could be avoided with the embed query
function resolveSubcategoryNames() {
    gameIDs = Object.keys(pbList)
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            if (currentPBEntry.isLevel) {
                levelCategoryAPILink = `https://www.speedrun.com/api/v1/levels/${currentPBEntry.levelID}/categories`
                getLevelCategories(levelCategoryAPILink, currentPBEntry)
            }
            else if (currentPBEntry.subcategoryName != "") {
                // just append the subcategory
                currentPBEntry.categoryName += " - " + currentPBEntry.subcategoryName
            }
        }
    }
    // Then the variable link to fully construct the category link
    $.when.apply(null, deferreds).done(function() {
        deferreds = [] // clear ready for next group of calls
        getWorldRecords()
    });
}

function examineWorldRecordEntry(url, currentPBEntry) {
    deferreds.push($.getJSON(url, function(json) {
        wr = json.data
        // Guaranteed to a be wr as we only check categories that streamer has done
        // a run of, which means there is atleast one run (theres)
        currentPBEntry.wrLink = wr.runs[0].run.weblink
        currentPBEntry.wrTime = wr.runs[0].run.times.primary_t
    }))
}

function getWorldRecords() {
    gameIDs = Object.keys(pbList)
    // format for api link                          v if not null v
    //.../gameid/category/categoryid?top=1&var-subcategoryid=subcategoryvalue
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
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
            examineWorldRecordEntry(requestURL, currentPBEntry)
        }
    }
    // Now we can finally render the contents of the panel
    $.when.apply(null, deferreds).done(function() {
        deferreds = [] // clear ready for next group of calls
        renderPersonalBests()
    });
}

$(document).on('click', '.gameTitle', function(e) {
    id = e.currentTarget.id.substring(1)
    if($("#pbRow" + id).is(":hidden")) {
        $('#pbRowStatus' + id).html('<i class="far fa-minus-square fa-2x" aria-hidden="true"></i>')
    }
    else {
        $('#pbRowStatus' + id).html('<i class="far fa-plus-square fa-2x" aria-hidden="true"></i>')
    }
    $('#pbRow' + id).slideToggle('fast', function(){
        $(".pbWrapper").getNiceScroll().resize()
    });
});

function addFontFamily(setting) {
    if (setting == null) {
        return "Roboto Condensed"
    }
    return `${setting}, Roboto Condensed`
}

/// Renders the Panel with the given settings
function renderPersonalBests() {

    // Pull down all fonts early
    if (settings.hasOwnProperty('panelTitleFontFamily')) {
        WebFont.load({
            google: {
                families: [
                    settings.panelTitleFontFamily,
                    settings.categoryHeaderFontFamily,
                    settings.pbHeaderFontFamily,
                    settings.wrHeaderFontFamily,
                    settings.gameTitleFontFamily,
                    settings.gameCategoryFontFamily,
                    settings.pbFontFamily,
                    settings.wrFontFamily,
                    settings.miscHeaderFontFamily,
                    settings.ilHeaderFontFamily
                ]
            },
            timeout: 2000
        });
    }

    // Disable the spinner
    $('.spinnerWrapper').remove();
    $('.titleContainer').css("display", "block")
    $('.panelTitleDiv').css("display", "block")
    $('.pbWrapper').css("display", "block")

    // Add the Title
    $(".titleContainer").append(
        `<div class="row center" id="titleContainerRow">
            <a href="http://www.speedrun.com/user/${srcName}" target="_blank" id="titleLink">
                <h1 id="viewerPanelTitle">${settings.title}</h1>
            </a>
        </div>`
    )

    // Add the Headers
    if (settings.hideWR) {
        $(".titleContainer").append(
            `<div class="row" id="headers">
                <div class="col-8-10 titleHeaders" id="categoryHeader">
                    <h3>Category</h3></div>
                <div class="col-2-10 center titleHeaders" id="pbHeader">
                    <h3>PB</h3></div>
            </div>
            <br class="clear" />`
        )
    }
    else {
        $(".titleContainer").append(
            `<div class="row" id="headers">
                <div class="col-6-10 titleHeaders" id="categoryHeader">
                    <h3>Category</h3></div>
                <div class="col-2-10 center titleHeaders" id="pbHeader">
                    <h3>PB</h3></div>
                <div class="col-2-10 center titleHeaders" id="wrHeader">
                    <h3>WR</h3>
                </div>
            </div>
            <br class="clear" />`
        )
    }
    

    // Adding Games and PBs
    // Loop through every Game
    for (var i = 0; i < games.length; i++) {
        currentGame = pbList[games[i].id]
        gameName = games[i].name
        displayPBs = "none"
        initialIcon = "far fa-plus-square"
        if (games[i].shouldExpand == true) {
            displayPBs = "block"
            initialIcon = "far fa-minus-square"
        }
        // Add Game Name / Collapsable button
        $(".pbWrapper").append(
            `<div class="gameTitle outlineText" id="g${i}">
                <div class="col-8-10">
                    <h2>${gameName}</h2>
                </div>
                <div class="col-2-10 center expandIcon" id="pbRowStatus${i}">
                    <i class="${initialIcon} fa-2x" aria-hidden="true"></i>
                </div>
                <br class="clear" />
            </div>`
        )

        pbHTML =
            `<div class="pbContainer">
                <div class="pbRow outlineText" id="pbRow${i}" style="display: ${displayPBs};">
                    <ul>`

        // Get all the Personal Bests now
        // Normal Categories
        sortedCategories = sortCategories(games[i].categories, currentGame)
        for (var j = 0; j < sortedCategories.length; j++) {
            pb = sortedCategories[j]
            // TODO this can be pulled out into func
            if (settings.hideWR) {
                pbHTML +=
                `<li class="categoryRow">
                    <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                    <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                <br class="clear"></li>`
            }
            else {
                pbHTML +=
                `<li class="categoryRow">
                    <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                    <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                    <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                    <br class="clear"></li>`
            }
        }
        // Misc Categories, if desired
        sortedMiscCategories = sortMiscCategories(games[i].categories, currentGame)
        if (settings.miscShow && settings.miscSep && sortedMiscCategories.length > 0) {
            pbHTML +=
            `<li class="miscRowContainer">
                <div class="headerRow"><p class="miscHeader">Miscellaneous Categories</div>
            </li>`
        }
        if (settings.miscShow && sortedMiscCategories.length > 0) {
            for (var j = 0; j < sortedMiscCategories.length; j++) {
                pb = sortedMiscCategories[j]
                // TODO this can be pulled out into func
                if (settings.hideWR) {
                    pbHTML +=
                    `<li class="categoryRow">
                        <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                        <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        <br class="clear"></li>`
                }
                else {
                    pbHTML +=
                    `<li class="categoryRow">
                        <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                        <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                        <br class="clear"></li>`
                }
            }
        }
        // ILs, if desired
        sortedLevels = sortLevels(games[i].levels, currentGame)
        if (settings.ilShow && settings.ilSep && sortedLevels.length > 0) {
            pbHTML +=
            `<li class="ilRowContainer">
                <div class="headerRow"><p class="ilHeader">Individual Levels</div>
            </li>`
        }
        if (settings.ilShow && sortedLevels.length > 0) {
            for (var j = 0; j < sortedLevels.length; j++) {
                pb = sortedLevels[j]
                // TODO this can be pulled out into func
                if (settings.hideWR) {
                    pbHTML +=
                    `<li class="categoryRow">
                        <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                        <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        <br class="clear"></li>`
                }
                else {
                    pbHTML +=
                    `<li class="categoryRow">
                        <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                        <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                        <br class="clear"></li>`
                }
            }
        }

        pbHTML += `</ul></div></div><div class="gameDivider"></div>`

        // Add to the panel
        $(".pbWrapper").append(pbHTML)
    } // end of game loop

    // Setup Streamer's Styling
    // TODO pull this out into a function
    // Panel Title Background Settings
    if (settings.panelTitleTextShadow == true) {
        $(".outlineText").css("text-shadow", "2px 2px 3px #000, 2px 2px 3px #000")
    }
    var newPanelTitleHeight = settings.panelTitleHeight
    if (newPanelTitleHeight < 80) {
        newPanelTitleHeight = 80
    } else if (newPanelTitleHeight > 150) {
        newPanelTitleHeight = 150
    }
    $(".titleContainer").css("height", `${newPanelTitleHeight}px`)
    // Adjust the pbWrapper's height accordingly
    var newPbWrapperHeight = 500 - newPanelTitleHeight - 8
    $(".pbWrapper").css("height", `${newPbWrapperHeight}px`)
    if (settings.panelTitleBackgroundType == 'solid') {
        $('.titleContainer').css("background", settings.panelTitleBackgroundColor1)
    } else if (settings.panelTitleBackgroundType == 'vGradient') {
        $('.titleContainer').css("background", `linear-gradient(${settings.panelTitleBackgroundColor1}, ${settings.panelTitleBackgroundColor2})`)
    } else if (settings.panelTitleBackgroundType == 'hGradient') {
        $('.titleContainer').css("background", `linear-gradient(90deg, ${settings.panelTitleBackgroundColor1}, ${settings.panelTitleBackgroundColor2})`)
    } else {
        // do nothing, only one image and its the current default at the moment
    }

    // Panel Title Settings
    if (settings.panelTitleFontBold == false) { // Bold by default, so false
        $("#viewerPanelTitle").css("font-weight", "400")
    }
    if (settings.panelTitleFontItalic == true) {
        $("#viewerPanelTitle").css("font-style", "italic")
    }
    $("#viewerPanelTitle").css("font-size", `${settings.panelTitleFontSize}px`)
    $("#viewerPanelTitle").css("color", settings.panelTitleFontColor)
    if (!settings.hasOwnProperty('panelTitleFontFamily')) {
        dropSecond = settings.panelTitleFont.split(',')[0]
        settings.panelTitleFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $("#viewerPanelTitle").css("font-family", addFontFamily(settings.panelTitleFontFamily))
    if (settings.hasOwnProperty('panelTitleHeightPercentage')) {
        $("#titleContainerRow").css("height", `${settings.panelTitleHeightPercentage}%`)
    }

    // Category Header Settings
    if (!settings.hasOwnProperty('categoryHeaderFontBold')) {
        settings.categoryHeaderFontBold = settings.pbHeaderFontBold = settings.wrHeaderFontBold = settings.panelHeaderFontBold
        settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.panelHeaderFontItalic
        settings.categoryHeaderFontSize = settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.panelHeaderFontSize
        settings.categoryHeaderFontColor = settings.categoryHeaderFontColor = settings.categoryHeaderFontColor = settings.panelHeaderFontColor
        dropSecond = settings.panelHeaderFont.split(',')[0]
        settings.categoryHeaderFontFamily = settings.pbHeaderFontFamily = settings.wrHeaderFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    if (settings.categoryHeaderFontBold == false) { // Bold by default, so false
        $("#categoryHeader").css("font-weight", "400")
    }
    if (settings.categoryHeaderFontItalic == true) {
        $("#categoryHeader").css("font-style", "italic")
    }
    $("#categoryHeader").css("font-size", `${settings.categoryHeaderFontSize}px`)
    $("#categoryHeader").css("color", settings.categoryHeaderFontColor)
    $("#categoryHeader").css("font-family", addFontFamily(settings.categoryHeaderFontFamily))

    // Personal Best Header Settings
    if (settings.pbHeaderFontBold == false) { // Bold by default, so false
        $("#pbHeader").css("font-weight", "400")
    }
    if (settings.pbHeaderFontItalic == true) {
        $("#pbHeader").css("font-style", "italic")
    }
    $("#pbHeader").css("font-size", `${settings.pbHeaderFontSize}px`)
    $("#pbHeader").css("color", settings.pbHeaderFontColor)
    $("#pbHeader").css("font-family", addFontFamily(settings.pbHeaderFontFamily))

    // World Record Header Settings
    if (settings.wrHeaderFontBold == false) { // Bold by default, so false
        $("#wrHeader").css("font-weight", "400")
    }
    if (settings.wrHeaderFontItalic == true) {
        $("#wrHeader").css("font-style", "italic")
    }
    $("#wrHeader").css("font-size", `${settings.wrHeaderFontSize}px`)
    $("#wrHeader").css("color", settings.wrHeaderFontColor)
    $("#wrHeader").css("font-family", addFontFamily(settings.wrHeaderFontFamily))
    // WR Rainbow Cycling
    if (settings.wrRainbow == true) {
        $(".wrTime").css("animation", "rainbowText 10s linear infinite")
    }

    // Panel Title Divider Settings
    if (settings.hasOwnProperty('panelTitleDivHeight')) {
        $(".panelTitleDiv").css("height", `${settings.panelTitleDivHeight}px`);
        $(".panelTitleDiv").css("background", `linear-gradient(180deg, ${settings.panelTitleDivColor}, ${settings.panelBackgroundColor})`);
        $(".panelTitleDiv").css("margin-bottom", `${settings.panelTitleDivBottomMargin}px`);
    }

    // Game Title Settings
    if (settings.gameTitleFontBold == true) {
        $(".gameTitle").css("font-weight", "700")
    }
    if (settings.gameTitleFontItalic == true) {
        $(".gameTitle").css("font-style", "italic")
    }
    $(".gameTitle").css("font-size", `${settings.gameTitleFontSize}px`)
    $(".gameTitle").css("color", settings.gameTitleFontColor)
    if (!settings.hasOwnProperty('gameTitleFontFamily')) {
        dropSecond = settings.gameTitleFont.split(',')[0]
        settings.gameTitleFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $(".gameTitle").css("font-family", addFontFamily(settings.gameTitleFontFamily))

    // Expand / Collapse Icon Settings
    if (settings.hasOwnProperty('expandContractColor')) {
        $(".expandIcon").css("color", settings.expandContractColor)
    }

    // Category Name Settings
    if (settings.gameCategoryFontBold == true) {
        $(".categoryName").css("font-weight", "700")
    }
    if (settings.gameCategoryFontItalic == true) {
        $(".categoryName").css("font-style", "italic")
    }
    $(".categoryName").css("font-size", `${settings.gameCategoryFontSize}px`)
    $(".categoryName").css("color", settings.gameCategoryFontColor)
    if (!settings.hasOwnProperty('gameCategoryFontFamily')) {
        dropSecond = settings.gameCategoryFont.split(',')[0]
        settings.gameCategoryFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $(".categoryName").css("font-family", addFontFamily(settings.gameCategoryFontFamily))
    if (settings.hasOwnProperty('gameCategoryBottomMargin')) {
        $(".categoryRow").css("margin-bottom", `${settings.gameCategoryBottomMargin}px`)
    }
    
    // Personal Best Time Settings
    if (settings.pbFontBold == true) {
        $(".pbTime").css("font-weight", "700")
    }
    if (settings.pbFontItalic == true) {
        $(".pbTime").css("font-style", "italic")
    }
    $(".pbTime").css("font-size", `${settings.pbFontSize}px`)
    $(".pbTime").css("color", settings.pbFontColor)
    if (!settings.hasOwnProperty('pbFontFamily')) {
        dropSecond = settings.pbFont.split(',')[0]
        settings.pbFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $(".pbTime").css("font-family", addFontFamily(settings.pbFontFamily))

    // World Record Time Settings
    if (!settings.hasOwnProperty('wrFontBold')) {
        settings.wrFontBold = settings.pbFontBold
        settings.wrFontItalic = settings.pbFontItalic
        settings.wrFontColor = '#f3e221'
        settings.wrFontFamily = settings.pbFontFamily
    }
    if (settings.wrFontBold == true) {
        $(".wrTime").css("font-weight", "700")
    }
    if (settings.wrFontItalic == true) {
        $(".wrTime").css("font-style", "italic")
    }
    $(".wrTime").css("font-size", `${settings.wrFontSize}px`)
    $(".wrTime").css("color", settings.wrFontColor)
    $(".wrTime").css("font-family", addFontFamily(settings.wrFontFamily))

    // Misc Header Settings
    if (!settings.hasOwnProperty('miscHeaderFontBold')) {
        settings.miscHeaderFontBold = settings.ilHeaderFontBold = settings.timeHeaderFontBold
        settings.miscHeaderFontBold = settings.ilHeaderFontItalic = settings.timeHeaderFontItalic
        settings.miscHeaderFontSize = settings.ilHeaderFontSize = settings.timeHeaderFontSize
        settings.miscHeaderFontColor = settings.ilHeaderFontColor = settings.timeHeaderFontColor
        dropSecond = settings.timeHeaderFont.split(',')[0]
        settings.miscHeaderFontFamily = settings.ilHeaderFontFamily = dropSecond.substring(1, dropSecond.length-1)
        settings.miscHeaderBottomMargin = settings.ilHeaderBottomMargin = 0
    }
    if (settings.miscHeaderFontBold == true) {
        $(".miscHeader").css("font-weight", "700")
    }
    if (settings.miscHeaderFontItalic == true) {
        $(".miscHeader").css("font-style", "italic")
    }
    $(".miscHeader").css("font-size", `${settings.miscHeaderFontSize}px`)
    $(".miscHeader").css("color", settings.miscHeaderFontColor)
    $(".miscHeader").css("font-family", addFontFamily(settings.miscHeaderFontFamily))
    $(".miscRowContainer").css("margin-bottom", `${settings.miscHeaderBottomMargin}px`)

    // IL Header Settings
    if (settings.ilHeaderFontBold == true) {
        $(".ilHeader").css("font-weight", "700")
    }
    if (settings.ilHeaderFontItalic == true) {
        $(".ilHeader").css("font-style", "italic")
    }
    $(".ilHeader").css("font-size", `${settings.ilHeaderFontSize}px`)
    $(".ilHeader").css("color", settings.ilHeaderFontColor)
    $(".ilHeader").css("font-family", addFontFamily(settings.ilHeaderFontFamily))
    $(".ilRowContainer").css("margin-bottom", `${settings.ilHeaderBottomMargin}px`);

    // Game Divider Settings
    if (settings.hasOwnProperty('gameDivHeight')) {
        $(".gameDivider").css("height", `${settings.gameDivHeight}px`);
        $(".gameDivider").css("background", `linear-gradient(180deg, ${settings.gameDivColor}, #101010)`);
        $(".gameDivider").css("margin-bottom", `${settings.gameDivBottomMargin}px`);
    }
    
    // Panel Background Color
    $("#previewHolder").css("background-color", `${settings.panelBackgroundColor}`)
    $(".pbWrapper").css("background-color", `${settings.panelBackgroundColor}`)

    // Hover colors for links, progammatically darker
    $(".categoryName, .pbTime, .wrTime, #titleLink").hover(
        function(e) {
            nonHoverColor = rgb2hex($(e.target).css("color"))
            hoverColor = ((parseInt(nonHoverColor.replace(/^#/, ''), 16) & 0xfefefe) >> 1).toString(16);
            $(e.target).css("color", `#${("000000" + hoverColor).slice(-6)}`)
            e.target.name = nonHoverColor
        },
        function(e) {
            $(e.target).css("color", e.target.name)
            e.target.name = ""
        });
    
    if (!settings.hasOwnProperty('scrollbarWidth')) {
        settings.scrollbarColor = "#424242"
        settings.scrollbarOpacity = 100
        settings.scrollbarWidth = 5
    }
    $(".pbWrapper").niceScroll({
        cursorcolor: settings.scrollbarColor,
        cursorwidth: `${settings.scrollbarWidth}px`,
        cursorborder: "1px solid transparent",
        cursoropacitymax: parseInt(settings.scrollbarOpacity) / 100,
        autohidemode: "leave",
        nativeparentscrolling: false,
        iframeautoresize: true,
        enableobserver: true
    });
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function secondsToTimeStr(seconds) {
    conv_seconds = Math.round(seconds)
    minutes = parseInt(conv_seconds / 60)
    conv_seconds = ("0" + conv_seconds % 60).slice(-2);
    hours = (parseInt(minutes / 60));
    minutes = ("0" + minutes % 60).slice(-2);

    // Handle milliseconds
    if (hours == "00" && seconds.toString().includes(".")) {
        milliseconds = seconds.toString().split(".")[1]
        // Milliseconds only to 2 significant digits
        if (milliseconds.length > 2) {
            keep = milliseconds.substring(0, 2)
            round = milliseconds.substring(2)
            milliseconds = Math.round(parseFloat(`${keep}.${round}`).toString())
        }
        if (milliseconds.length == 1) {
            milliseconds += "0"
        }
        conv_seconds = Math.trunc(seconds)
        minutes = parseInt(conv_seconds / 60)
        minutes = ("0" + minutes % 60).slice(-2);
        conv_seconds = ("0" + conv_seconds % 60).slice(-2);
        if (minutes == "00") {
            return `${conv_seconds}.${milliseconds}`
        }
        else if (parseInt(minutes) < 10) {
            return `${parseInt(minutes)}:${conv_seconds}.${milliseconds}`
        }
        return `${minutes}:${conv_seconds}.${milliseconds}`
    }
    if (hours == "00") {
        if (parseInt(minutes) < 10) {
            return `${parseInt(minutes)}:${conv_seconds}`
        }
        else if (minutes == "00") {
            return `${conv_seconds}`
        }
        return `${minutes}:${conv_seconds}`
    }
    return `${hours}:${minutes}:${conv_seconds}`
}

function sortCategories(expectedOrder, categories) {
    ordered = []
    // Backwards compatibility patch v0.3.0 -> 1.0.0
    if (expectedOrder == undefined) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].isLevel == false && categories[i].isMisc == false) {
                ordered.push(categories[i])
            }
        }
        return ordered
    }
    for (var i = 0; i < expectedOrder.length; i++) {
        // Look for that value in categories
        for (var j = 0; j < categories.length; j++) {
            if (categories[j].isMisc == false && categories[j].categoryID == expectedOrder[i]) {
                ordered.push(categories[j])
            }
        }
    }
    return ordered
}

function sortMiscCategories(expectedOrder, categories) {
    ordered = []
    // Backwards compatibility patch v0.3.0 -> 1.0.0
    if (expectedOrder == undefined) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].isLevel == false && categories[i].isMisc == true) {
                ordered.push(categories[i])
            }
        }
        return ordered
    }
    for (var i = 0; i < expectedOrder.length; i++) {
        // Look for that value in categories
        for (var j = 0; j < categories.length; j++) {
            if (categories[j].isMisc && categories[j].categoryID == expectedOrder[i]) {
                ordered.push(categories[j])
            }
        }
    }
    return ordered
}

function sortLevels(expectedOrder, levels) {
    ordered = []
    // Backwards compatibility patch v0.3.0 -> 1.0.0
    if (expectedOrder == undefined) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i].isLevel == true) {
                ordered.push(levels[i])
            }
        }
        return ordered
    }
    for (var i = 0; i < expectedOrder.length; i++) {
        // Look for that value in categories
        for (var j = 0; j < levels.length; j++) {
            if (levels[j].isLevel && levels[j].levelID == expectedOrder[i]) {
                ordered.push(levels[j])
            }
        }
    }
    return ordered
}