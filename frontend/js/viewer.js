/// Javascript to render the personal bests on the channel page
var loaded = false

var games
var settings
var srcID

var pbList = new Array()

window.Twitch.ext.onAuthorized(function(auth) {

    // console.log('The JWT that will be passed to the EBS is', auth.token);
    // console.log('The channel ID is', auth.channelId);
    if (loaded == true) {
        return;
    }
    loaded = true

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
                hidePBs = res.data.hidePBs
                // First we will get all the runner's personal bests
                $.ajax({
                    url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
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
});

var asyncLoop = function(o) {
    var iter = -1
    var length = o.length

    var loop = function() {
        iter++
        if (iter == length) {
            o.callback();
            return;
        }
        o.functionToLoop(loop, iter)
    }
    loop();
}

function getPersonalBests(json) {

    personalBests = json.data
    asyncLoop({
        length: personalBests.length,
        functionToLoop: function(loop, iter) {
            // NOTE can get rank pb.place
            run = personalBests[iter].run
            // If this is one of the games that should be tracked
            index = games.findIndex(x => x.id === run.game)
            if (index > -1) {
                // If this is the first game there, init the spot
                if (pbList[run.game] == null) {
                    pbList[run.game] = new Array()
                }
                pbList[run.game].push({
                    gameId: run.game, // laziness, but with good intentions
                    categoryID: run.category,
                    categoryName: null,
                    categoryLink: null,
                    subcategoryID: null, // may not exist, will leave null if that is the case
                    subcategoryVal: null, // may not exist, will leave null if that is the case
                    levelID: run.level, // will be null if not a level
                    variables: run.values, // We have no guarantee which variables are subcategories or not until we check
                    pbTime: run.times.primary_t,
                    pbLink: run.weblink,
                    wrLink: null,
                    wrTime: null,
                    isMisc: false,
                    isLevel: run.level != null,
                    rank: personalBests[iter].place
                })
            }
            loop()
        },
        callback: function() {
            // We will get the category link first then
            getCategories()
        }
    })
}

var deferreds = []
function getCategoryName(url, currentPBEntry) {
    deferreds.push($.getJSON(url, function(json) {
        category = json.data
        if (currentPBEntry.isLevel) {
            categories = category
            for (var i = 0; i < categories.length; i++) {
                if (categories[i].id == currentPBEntry.categoryID) {
                    category = categories[i]
                }
            }
            // if there is only one category, then we can omit the name
            if (categories.length > 1) {
                currentPBEntry.categoryName = ` - ${category.name}`
            }
            else {
                currentPBEntry.categoryName = ""
            }
            currentPBEntry.categoryLink = category.weblink
            currentPBEntry.isMisc = category.miscellaneous
        }
        else {
            currentPBEntry.categoryName = category.name
            currentPBEntry.categoryLink = category.weblink
            currentPBEntry.isMisc = category.miscellaneous
        }
    }))
}

function getCategories() {
    gameIDs = Object.keys(pbList)
    categoryAPILink = "https://www.speedrun.com/api/v1/categories/"
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            if (currentPBEntry.isLevel) {
                levelCategoryAPILink = `https://www.speedrun.com/api/v1/levels/${currentPBEntry.levelID}/categories`
                getCategoryName(levelCategoryAPILink, currentPBEntry)
            }
            else {
                getCategoryName(categoryAPILink + currentPBEntry.categoryID, currentPBEntry)
            }
        }
    }
    // Then the variable link to fully construct the category link
    $.when.apply(null, deferreds).done(function() {
        getSubcategories()
        deferreds = [] // clear ready for next group of calls
    });
}

function examineVariables(url, currentPBEntry) {

    deferreds.push($.getJSON(url, function(json) {
        variables = json.data
        for (var i = 0; i < variables.length; i++) {
            if (variables[i]["is-subcategory"] == true &&
                variables[i].id in currentPBEntry.variables) {
                
                // Then its the right subcategory, grab it's label and such
                currentPBEntry.subcategoryID = variables[i].id
                currentPBEntry.subcategoryVal = currentPBEntry.variables[currentPBEntry.subcategoryID]

                // Find the value now with the subcategoryVal
                currentPBEntry.categoryName += " - " + variables[i].values.values[currentPBEntry.subcategoryVal].label
            }
        }
    }))
}

function getSubcategories() {
    gameIDs = Object.keys(pbList)
    variableAPILink = "https://www.speedrun.com/api/v1/categories/"
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            if (currentPBEntry.isLevel) {
                levelVariableAPILink = `https://www.speedrun.com/api/v1/levels/${currentPBEntry.levelID}/variables`
                examineVariables(levelVariableAPILink, currentPBEntry)
            }
            else {
                examineVariables(variableAPILink + currentPBEntry.categoryID + "/variables", currentPBEntry)
            }
        }
    }
    // Finally, get the WR's information
    $.when.apply(null, deferreds).done(function() {
        getWorldRecords()
        deferreds = [] // clear ready for next group of calls
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
        getLevelNames()
        deferreds = [] // clear ready for next group of calls
    });
}

function examineLevelEntry(url, currentPBEntry) {
    deferreds.push($.getJSON(url, function(json) {
        level = json.data
        currentPBEntry.categoryName = level.name + currentPBEntry.categoryName
    }))
}

function getLevelNames() {
    gameIDs = Object.keys(pbList)
    // format for api link
    // ../levels/nwl7kg9v
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            if (currentPBEntry.isLevel == true) {
                // Construct API Request
                requestURL = `https://www.speedrun.com/api/v1/levels/${currentPBEntry.levelID}`
                examineLevelEntry(requestURL, currentPBEntry)
            }
        }
    }
    // Now we can finally render the contents of the panel
    $.when.apply(null, deferreds).done(function() {
        renderPersonalBests()
        deferreds = [] // clear ready for next group of calls
    });
}

$(document).on('click', '.gameTitle', function(e) {
    id = e.currentTarget.id.substring(1)
    if($("#pbRow" + id).is(":hidden")) {
        $('#pbRowStatus' + id).html('<i class="fa fa-minus-square-o fa-2x" aria-hidden="true"></i>')
    }
    else {
        $('#pbRowStatus' + id).html('<i class="fa fa-plus-square-o fa-2x" aria-hidden="true"></i>')
    }
    $('#pbRow' + id).slideToggle('fast');
});



/// Renders the Panel with the given settings
function renderPersonalBests() {

    // Disable the spinner
    $('.spinnerWrapper').remove();
    $('.titleContainer').css("display", "block")
    $('.fancyStripeGreen').css("display", "block")
    $('.pbWrapper').css("display", "block")

    // Add the Title
    $(".titleContainer").append(
        `<div class="row center" id="titleContainerRow">
            <h1 id="viewerPanelTitle">${settings.title}</h1>
        </div>`
    )

    // Add the Headers
    if (settings.hideWR) {
        $(".titleContainer").append(
            `<div class="row" id="headers">
                <div class="col-8-10 titleHeaders">
                    <h3>Category</h3></div>
                <div class="col-2-10 center titleHeaders">
                    <h3>PB</h3></div>
            </div>
            <br class="clear" />`
        )
    }
    else {
        $(".titleContainer").append(
            `<div class="row" id="headers">
                <div class="col-6-10 titleHeaders">
                    <h3>Category</h3></div>
                <div class="col-2-10 center titleHeaders">
                    <h3>PB</h3></div>
                <div class="col-2-10 center titleHeaders">
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
        // Add Game Name / Collapsable button
        $(".pbWrapper").append(
            `<div class="gameTitle outlineText" id="g${i}">
                <div class="col-8-10">
                    <h2>${gameName}</h2>
                </div>
                <div class="col-2-10 center" id="pbRowStatus${i}">
                    <i class="fa fa-plus-square-o fa-2x" aria-hidden="true"></i>
                </div>
                <br class="clear" />
            </div>
            <div class="fancyStripeBlue"></div>`
        )
        displayPBs = "none"
        if (games[i].shouldExpand == true) {
            displayPBs = "block"
        }
        pbHTML =
            `<div class="pbContainer">
            <div class="row">
                <div class="pbRow outlineText" id="pbRow${i}" style="display: ${displayPBs};">
                    <ul>`

        // Sort the categories by their names
        // TODO move this to the config page, assume given in correct order
        currentGame.sort(dynamicSort("categoryName"))
        // Get all the Personal Bests now
        var anyLevels = false
        var anyMiscs = false
        for (var j = 0; j < currentGame.length; j++) {

            pb = currentGame[j]
            // Skip misc
            if ((settings.miscShow == false || settings.miscSep == true) && pb.isMisc == true) {
                anyMiscs = true
                continue
            }
            // Skip ils
            if ((settings.ilShow == false || settings.ilSep == true) && pb.isLevel == true) {
                anyLevels = true
                continue
            }

            if (settings.hideWR) {
                pbHTML +=
                    `<li>
                    <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                    <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                </li>`
            }
            else {
                pbHTML +=
                    `<li>
                    <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                    <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                    <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                </li>`
            }
        }
        // If we wanted to seperate runs, print misc > ils now
        if (settings.miscShow == true && settings.miscSep == true && anyMiscs == true) {
            pbHTML +=
                `<li>
                <div><p class="timeHeader">Miscellaneous Categories</div>
            </li>`
            for (var j = 0; j < currentGame.length; j++) {
                pb = currentGame[j]
                // Only mess with misc categories
                if (pb.isMisc == true) {
                    if (settings.hideWR) {
                        pbHTML +=
                            `<li>
                            <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                            <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        </li>`
                    }
                    else {
                        pbHTML +=
                            `<li>
                            <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                            <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                            <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                        </li>`
                    }
                }
            }
        }

        if (settings.ilShow == true && settings.ilSep == true && anyLevels == true) {
            pbHTML +=
                `<li>
                <div><p class="timeHeader">Individual Levels</div>
            </li>`
            for (var j = 0; j < currentGame.length; j++) {
                pb = currentGame[j]
                // Only mess with individual levels
                if (pb.isLevel == true) {
                    if (settings.hideWR) {
                        pbHTML +=
                            `<li>
                            <div class="col-8-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                            <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                        </li>`
                    }
                    else {
                        pbHTML +=
                            `<li>
                            <div class="col-6-10 truncate"><a class="categoryName" href="${pb.categoryLink}" target="_blank" title="${pb.categoryName}">${pb.categoryName}</a></div>
                            <div class="col-2-10 rightAlign"><a class="pbTime" href="${pb.pbLink}" target="_blank">${secondsToTimeStr(pb.pbTime)}</a></div>
                            <div class="col-2-10 rightAlign"><a class="wrTime" href="${pb.wrLink}" target="_blank">${secondsToTimeStr(pb.wrTime)}</a></div>
                        </li>`
                    }
                }
            }
        }

        pbHTML += `</ul></div></div></div>`

        // Add to the panel
        $(".pbWrapper").append(pbHTML)
    } // end of game loop

    // Setup Streamer's Styling
    // panelTitleDivColor
    $(".fancyStripeGreen").css("background", `linear-gradient(180deg, ${settings.panelTitleDivColor}, #101010)`);
    // gameTitleDivColor
    $(".fancyStripeBlue").css("background", `linear-gradient(0deg, #101010, ${settings.gameTitleDivColor})`)

    // panelBackgroundColor
    if (settings.panelTitleBackgroundType == 'solid') {
        $('.titleContainer').css("background", settings.panelTitleBackgroundColor1)
    } else if (settings.panelTitleBackgroundType == 'vGradient') {
        $('.titleContainer').css("background", `linear-gradient(${settings.panelTitleBackgroundColor1}, ${settings.panelTitleBackgroundColor2})`)
    } else if (settings.panelTitleBackgroundType == 'hGradient') {
        $('.titleContainer').css("background", `linear-gradient(90deg, ${settings.panelTitleBackgroundColor1}, ${settings.panelTitleBackgroundColor2})`)
    } else {
        // do nothing, only one image and its the current default at the moment
    }

    // WR Rainbow Cycling
    if (settings.wrRainbow == true) {
        $(".wrTime").css("animation", "rainbowText 10s linear infinite")
    }


    // Panel title Height
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

    // Panel Background Color
    $("body").css("background-color", `${settings.panelBackgroundColor}`)

    // panelTitleShadow
    if (settings.panelTitleShadow == true) {
        $(".outlineText").css("text-shadow", "2px 2px 3px #000, 2px 2px 3px #000")
    }

    // panelTitleFontBold
    if (settings.panelTitleFontBold == false) { // Bold by default, so false
        $("#viewerPanelTitle").css("font-weight", "400")
    }
    // panelTitleFontItalic
    if (settings.panelTitleFontItalic == true) {
        $("#viewerPanelTitle").css("font-style", "italic")
    }
    // panelTitleFontSize
    $("#viewerPanelTitle").css("font-size", `${settings.panelTitleFontSize}px`)
    // panelTitleFontColor
    $("#viewerPanelTitle").css("color", settings.panelTitleFontColor)
    // panelTitleFont
    $("#viewerPanelTitle").css("font-family", settings.panelTitleFont)

    // panelHeaderFontBold
    if (settings.panelHeaderFontBold == false) { // Bold by default, so false
        $("#headers").css("font-weight", "400")
    }
    // panelHeaderFontItalic
    if (settings.panelHeaderFontItalic == true) {
        $("#headers").css("font-style", "italic")
    }
    // panelHeaderFontSize
    $("#headers").css("font-size", `${settings.panelHeaderFontSize}px`)
    // panelHeaderFontColor
    $("#headers").css("color", settings.panelHeaderFontColor)
    // panelHeaderFont
    $("#headers").css("font-family", settings.panelHeaderFont)

    // gameTitleFontBold
    if (settings.gameTitleFontBold == true) {
        $(".gameTitle").css("font-weight", "700")
    }
    // gameTitleFontItalic
    if (settings.gameTitleFontItalic == true) {
        $(".gameTitle").css("font-style", "italic")
    }
    // gameTitleFontSize
    $(".gameTitle").css("font-size", `${settings.gameTitleFontSize}px`)
    // gameTitleFontColor
    $(".gameTitle").css("color", settings.gameTitleFontColor)
    // gameTitleFont
    $(".gameTitle").css("font-family", settings.gameTitleFont)

    // gameCategoryFontBold
    if (settings.gameCategoryFontBold == true) {
        $(".categoryName").css("font-weight", "700")
    }
    // gameCategoryFontItalic
    if (settings.gameCategoryFontItalic == true) {
        $(".categoryName").css("font-style", "italic")
    }
    // gameCategoryFontSize
    $(".categoryName").css("font-size", `${settings.gameCategoryFontSize}px`)
    // gameCategoryFontColor
    $(".categoryName").css("color", settings.gameCategoryFontColor)
    // gameCategoryFont
    $(".categoryName").css("font-family", settings.gameCategoryFont)

    // pbFontBold
    if (settings.pbFontBold == true) {
        $(".pbTime").css("font-weight", 700)
    }
    // pbFontItalic
    if (settings.pbFontItalic == true) {
        $(".pbTime").css("font-style", "italic")
    }
    // pbFontSize
    $(".pbTime").css("font-size", `${settings.pbFontSize}px`)
    // pbFontColor
    $(".pbTime").css("color", settings.pbFontColor)
    // pbFont
    $(".pbTime").css("font-family", settings.pbFont)

    // wrFontBold
    if (settings.pbFontBold == true) {
        $(".wrTime").css("font-weight", 700)
    }
    // wrFontItalic
    if (settings.pbFontItalic == true) {
        $(".wrTime").css("font-style", "italic")
    }
    // wrFontSize
    $(".wrTime").css("font-size", `${settings.pbFontSize}px`)
    // wrFont
    $(".wrTime").css("font-family", settings.pbFont)

    // timeHeaderFontBold
    if (settings.timeHeaderFontBold == true) {
        $(".timeHeader").css("font-weight", 700)
    }
    // timeHeaderFontItalic
    if (settings.timeHeaderFontItalic == true) {
        $(".timeHeader").css("font-style", "italic")
    }
    // timeHeaderFontSize
    $(".timeHeader").css("font-size", `${settings.timeHeaderFontSize}px`)
    // timeHeaderFontColor
    $(".timeHeader").css("color", settings.timeHeaderFontColor)
    // timeHeaderFont
    $(".timeHeader").css("font-family", settings.timeHeaderFont)

    // Hover colors for links, progammatically darker
    $(".categoryName, .pbTime, .wrTime").hover(
        function(e) {
            nonHoverColor = rgb2hex($(e.target).css("color"))
            hoverColor = (parseInt(nonHoverColor.replace(/^#/, ''), 16) & 0xfefefe) >> 1;
            $(e.target).css("color", `#${hoverColor.toString(16)}`)
            e.target.name = nonHoverColor
        },
        function(e) {
            $(e.target).css("color", e.target.name)
            e.target.name = ""
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
    hours = ("0" + parseInt(minutes / 60)).slice(-2);
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
        conv_seconds = ("0" + conv_seconds % 60).slice(-2);
        return `${minutes}:${conv_seconds}.${milliseconds}`
    }
    if (hours == "00")
        return `${minutes}:${conv_seconds}`
    return `${hours}:${minutes}:${conv_seconds}`
}

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function(a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

$(document).ready(function() {

    $(".frameWrapper").append(
        `<section class="spinnerWrapper">
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
        </section>`
    )
})
