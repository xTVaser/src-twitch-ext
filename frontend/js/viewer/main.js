/// Debug Vars
var debug = false;

// TODO - detect if older browser and if so, display an upfront error
// - async functions - https://caniuse.com/#search=await 
// - fetch API - https://caniuse.com/#search=fetch / https://github.com/github/fetch
// - 

/// Javascript to render the personal bests on the channel page
var loaded = false

var games
var settings
var srcID
var srcName

// pbList
var personalBests = new Array();

// Templates
var templates = {
    'spinnerTemplate': undefined,
    'titleTemplate': undefined,
    'headerTemplate': undefined,
    'gameTemplate': undefined
}

var spinnerTemplatePromise = fetchMustacheTemplate("js/viewer/templates/spinner.mst", 'spinnerTemplate');
var titleTemplatePromise = fetchMustacheTemplate("js/viewer/templates/title.mst", 'titleTemplate');
var headerTemplatePromise = fetchMustacheTemplate("js/viewer/templates/headers.mst", 'headerTemplate');
var gameTemplatePromise = fetchMustacheTemplate("js/viewer/templates/game.mst", 'gameTemplate');

async function renderSpinner() {
    await spinnerTemplatePromise;
    $(".frameWrapper").append(Mustache.render(templates['spinnerTemplate']));
}

$(document).ready(function() {

    renderSpinner();
    if (debug == true) {
        console.log('The JWT that will be passed to the EBS is', auth.token);
        console.log('The channel ID is', auth.channelId);
    }

    if (loaded == true) {
        return;
    }
    loaded = true
    for (var i = 1; i <= 8; i++) {
        var random_color = '#'+Math.floor(Math.random()*16777215).toString(16);
        $(`div.spinner i:nth-child(${i})`).css('border-color', random_color);
    }

    res = {
        "status": 200,
        "message": "Retrieved Data Successfully",
        "data": {
            "settings": "{\"title\":\"My Personal Bests\",\"panelTitleHeight\":\"100\",\"panelTitleTextShadow\":false,\"panelTitleBackgroundType\":\"vGradient\",\"panelTitleBackgroundColor1\":\"#0000ff\",\"panelTitleBackgroundColor2\":\"#000000\",\"panelTitleFontBold\":false,\"panelTitleFontItalic\":false,\"panelTitleFontSize\":\"30\",\"panelTitleFontColor\":\"#ffffff\",\"panelTitleFontFamily\":\"Roboto Condensed\",\"panelTitleHeightPercentage\":\"75\",\"panelTitleShadow\":false,\"categoryHeaderFontBold\":false,\"categoryHeaderFontItalic\":false,\"categoryHeaderFontSize\":\"14\",\"categoryHeaderFontColor\":\"#ffffff\",\"categoryHeaderFontFamily\":\"Roboto Condensed\",\"pbHeaderFontBold\":false,\"pbHeaderFontItalic\":false,\"pbHeaderFontSize\":\"14\",\"pbHeaderFontColor\":\"#ffffff\",\"pbHeaderFontFamily\":\"Roboto Condensed\",\"wrHeaderFontBold\":false,\"wrHeaderFontItalic\":false,\"wrHeaderFontSize\":\"14\",\"wrHeaderFontColor\":\"#ffffff\",\"wrHeaderFontFamily\":\"Roboto Condensed\",\"hideWR\":false,\"wrRainbow\":false,\"panelTitleDivHeight\":\"5\",\"panelTitleDivColor\":\"#00ff00\",\"panelTitleDivBottomMargin\":\"0\",\"gameTitleFontBold\":false,\"gameTitleFontItalic\":false,\"gameTitleFontSize\":\"19\",\"gameTitleFontColor\":\"#ffffff\",\"gameTitleFontFamily\":\"Roboto Condensed\",\"expandContractColor\":\"#ffffff\",\"gameCategoryFontBold\":false,\"gameCategoryFontItalic\":false,\"gameCategoryFontSize\":\"14\",\"gameCategoryFontColor\":\"#f1eecb\",\"gameCategoryFontFamily\":\"Roboto Condensed\",\"gameCategoryBottomMargin\":\"0\",\"pbFontBold\":false,\"pbFontItalic\":false,\"pbFontSize\":\"15\",\"pbFontColor\":\"#ffffff\",\"pbFontFamily\":\"Roboto Condensed\",\"wrFontBold\":false,\"wrFontItalic\":false,\"wrFontSize\":\"15\",\"wrFontColor\":\"#f3e221\",\"wrFontFamily\":\"Roboto Condensed\",\"miscHeaderFontBold\":false,\"miscHeaderFontItalic\":false,\"miscHeaderFontSize\":\"15\",\"miscHeaderFontColor\":\"#ffffff\",\"miscHeaderFontFamily\":\"Roboto Condensed\",\"miscHeaderBottomMargin\":\"0\",\"miscShow\":true,\"miscSep\":true,\"ilHeaderFontBold\":false,\"ilHeaderFontItalic\":false,\"ilHeaderFontSize\":\"15\",\"ilHeaderFontColor\":\"#ffffff\",\"ilHeaderFontFamily\":\"Roboto Condensed\",\"ilHeaderBottomMargin\":\"0\",\"ilShow\":true,\"ilSep\":true,\"gameDivHeight\":\"5\",\"gameDivColor\":\"#ff8000\",\"gameDivBottomMargin\":\"5\",\"panelBackgroundColor\":\"#101010\",\"scrollbarWidth\":\"5\",\"scrollbarOpacity\":\"100\",\"scrollbarColor\":\"#424242\"}",
            "games": "[{\"name\":\"Jak II\",\"id\":\"ok6qlo1g\",\"shouldExpand\":true,\"categories\":[\"mkeon9d6\",\"7dg8q424\",\"wdmze42q\",\"xd1rxxrk\",\"vdo0jodp\",\"wkpj7vkr\"],\"categoryNames\":[\"All Missions\",\"100%\",\"Any%\",\"Any% Hoverless\"],\"miscCategoryNames\":[\"Any% Hero Mode\",\"Any% All Orbs\"],\"levels\":[\"nwl7n2p9\",\"ldypj3jd\",\"gdrqgy89\",\"ywe8nqqw\",\"69z4x86w\",\"nwl7kg9v\",\"r9g27opd\",\"z98jv1wl\",\"gdrqkk9z\",\"n9305r90\",\"ldye77w3\",\"rw6vp697\",\"rdn5j6dm\",\"ywe8z4wl\"],\"levelNames\":[\"Blow up Strip Mine Eco Wells\",\"Beat Time to Race Garage\",\"Catch Scouts in Haven Forest\",\"Destroy Cargo in Port\",\"Destroy Equipment at Dig Site\",\"Erol Race\",\"Lifeseed Ghosttown\",\"NYFE-Race Class 1\",\"NYFE-Race Class 1 Reverse\",\"NYFE-Race Class 2\",\"NYFE-Race Class 2 Reverse\",\"NYFE-Race Class 3\",\"NYFE-Race Class 3 Reverse\",\"Port Race\"]},{\"name\":\"Jak II Flashgame\",\"id\":\"3692x0dl\",\"shouldExpand\":false,\"categories\":[\"5dwj1o0k\",\"z27gv7o2\"],\"categoryNames\":[\"Any%\",\"Any% Hero Mode\"],\"miscCategoryNames\":[],\"levels\":[],\"levelNames\":[]}]",
            "srcID": "e8envo80",
            "srcName": "xTVaser"
        },
        "configMessage": "Speedrun.com's API has been very slow / failing to return quite a lot recently.  This will hopefully be mitigated in the future but it is largely out of my control, sorry.  Finding games may take several re-attempts.",
        "panelMessage": "Speedrun.com's API has been experiencing problems, Loading will unfortunately be slow or fail at times."
    };
    if (res.hasOwnProperty('data') == true) {
        $('.spinnerError').html(res.panelMessage)
        games = JSON.parse(res.data.games)
        settings = JSON.parse(res.data.settings)
        srcID = res.data.srcID
        srcName = res.data.srcName
        hidePBs = res.data.hidePBs
        gatherSpeedrunData();
    } else {
        $('.spinnerError').html('Extension not Configured')
    }
    // TODO - fetch not AJAX
    // $.ajax({
    //     type: "POST",
    //     url: "https://extension.xtvaser.xyz/fetch",
    //     headers: {
    //         'x-extension-jwt': auth.token,
    //     },
    //     dataType: "json",
    //     data: {},
    //     success: function(res) {
    //         if (res.hasOwnProperty('data') == true) {
    //             $('.spinnerError').html(res.panelMessage)
    //             games = JSON.parse(res.data.games)
    //             settings = JSON.parse(res.data.settings)
    //             srcID = res.data.srcID
    //             srcName = res.data.srcName
    //             hidePBs = res.data.hidePBs
    //             // First we will get all the runner's personal bests
    //             $.ajax({
    //                 url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests?embed=category.variables,level.variables",
    //                 dataType: "json",
    //                 success: function(data) {
    //                     getPersonalBests(data)
    //                 }
    //             });
    //         } else {
    //             $('.spinnerError').html('Extension not Configured')
    //         }
    //     },
    //     error: function() {
    //         $('.spinnerError').html('Extension Error')
    //     }
    // });
});

async function gatherSpeedrunData() {
    await getPersonalBests(srcID, games, personalBests);
    await resolveSubcategoryNames(personalBests);
    await getWorldRecords(personalBests);
    renderPersonalBests();
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

/// Renders the Panel with the given settings
async function renderPersonalBests() {

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

    // Append Title
    await titleTemplatePromise;
    $('.titleContainer').append(Mustache.render(templates['titleTemplate'], {
        srcName: srcName,
        settings: settings
    }));

    // Append Title Headers
    await headerTemplatePromise;
    $(".titleContainer").append(Mustache.render(templates['headerTemplate'], {
        categoryColumnSize: settings.hideWR ? "col-8-10" : "col-6-10",
        hideWorldRecordColumn: settings.hideWR
    }));

    // Adding Games and PBs
    // Loop through every Game
    await gameTemplatePromise;
    for (var i = 0; i < games.length; i++) {
        currentGame = personalBests[games[i].id]

        // Get all the Personal Bests now
        // Normal Categories
        categories = humanReadableTimes(sortCategories(games[i].categories, currentGame));
        miscCategories = undefined;
        // Fetch Misc Categories if enabled
        if (settings.miscShow) {
            miscCategories = humanReadableTimes(sortMiscCategories(games[i].categories, currentGame));
        }
        // Fetch Individual Levels if enabled
        levels = undefined;
        if (settings.ilShow) {
            levels = humanReadableTimes(sortLevels(games[i].levels, currentGame));
        }

        $(".pbWrapper").append(Mustache.render(templates['gameTemplate'], {
            key: i,
            settings: settings,
            gameName: games[i].name,
            initialExpandIcon: games[i].shouldExpand ? "far fa-minus-square" : "far fa-plus-square",
            expandPBs: games[i].shouldExpand ? "block" : "none",
            categoryColumnSize: settings.hideWR ? "col-8-10" : "col-6-10",
            categories: categories,
            showMiscCategories: settings.miscShow && miscCategories.length > 0,
            miscCategories: miscCategories,
            showLevels: settings.ilShow && levels.length > 0,
            levels: levels,
        }))
    }

    // Configure CSS Styling
    configureCustomStyling();
}

function humanReadableTimes(list) {
    adjusted = []
    for (var i = 0; i < list.length; i++) {
        pb = list[i];
        pb.pbTime = secondsToTimeStr(pb.pbTime);
        pb.wrTime = secondsToTimeStr(pb.wrTime);
        adjusted.push(pb);
    }
    return adjusted;
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
    // TODO - This can probably be eliminated during migrations
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
