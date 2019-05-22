// TODO - detect if older browser and if so, display an upfront error / add poly-fills if available
// - async functions - https://caniuse.com/#search=await
// - fetch API - https://caniuse.com/#search=fetch / https://github.com/github/fetch

/// Javascript to render the personal bests on the channel page

// This is to solve issues specifically with hosting, where the authorized event fires
// multiple times, causing the panel to render more than once
var loaded = false

// Detect if we are running locally (dev) or in a deployed env.
var DEV_URL = "http://localhost:8081";
var DEV_ENV = window.location.href.startsWith("http://localhost");

var PROD_URL = "https://extension.xtvaser.xyz";

var authObject = null;
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

var spinnerTemplatePromise = fetchMustacheTemplate("js/common/templates/spinner.mst", 'spinnerTemplate');
var titleTemplatePromise = fetchMustacheTemplate("js/viewer/templates/title.mst", 'titleTemplate');
var headerTemplatePromise = fetchMustacheTemplate("js/viewer/templates/headers.mst", 'headerTemplate');
var gameTemplatePromise = fetchMustacheTemplate("js/viewer/templates/game.mst", 'gameTemplate');

async function renderSpinner() {
    await spinnerTemplatePromise;
    $(".frameWrapper").append(Mustache.render(templates['spinnerTemplate']));
}

if (DEV_ENV) {
    $(document).ready(function () {
        authObject = {
            "channelId": "test123",
            "clientId": "test123",
            // Token Contents, signed with "password123":
            // {
            //     "channel_id": "test123"
            // }
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsX2lkIjoidGVzdDEyMyJ9.kfCD7f2bKwBtdXJfhQbEzv5OZHqgRKbl6Qn8-1taqlA"
        };
        renderViewer();
    });
}


window.Twitch.ext.onAuthorized(function (auth) {
    authObject = auth;
    renderViewer();
});

async function renderViewer() {
    renderSpinner();
    if (loaded == true) {
        return;
    }
    loaded = true;

    if (DEV_ENV) {
        console.log('The JWT that will be passed to the EBS is', authObject.token);
        console.log('The channel ID is', authObject.channelId);
    }

    // Get previous settings
    var backendFetchUrl = DEV_ENV ? `${DEV_URL}/fetch` : `${PROD_URL}/fetch`;
    var response = await fetch(backendFetchUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'x-extension-jwt': authObject.token
        },
    });

    // TODO - error handling on await calls https://alligator.io/js/fetch-api/
    // - $('.spinnerError').html('Extension Error')
    if (response.ok) {
        var resp = await response.json();
        if (resp.hasOwnProperty('data') == true) {
            $('.spinnerError').html(resp.panelMessage)
            games = JSON.parse(resp.data.games)
            settings = JSON.parse(resp.data.settings)
            srcID = resp.data.srcID
            srcName = resp.data.srcName
            hidePBs = resp.data.hidePBs
            await gatherSpeedrunData();
        } else {
            $('.spinnerError').html('Extension not Configured')
        }
    }
}

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
