/// Config Page for Frontend
var loaded = false;

var authObject = null;
var srcID = null;
var srcName = null;

// Detect if we are running locally (dev) or in a deployed env.
var DEV_URL = "http://localhost:8081"
var DEV_ENV = window.location.href.startsWith("http://localhost");

var PROD_URL = "https://extension.xtvaser.xyz";

// Templates
var templates = {
    'gameTemplate': undefined,
    'spinnerTemplate': undefined
}

var gameTemplatePromise = fetchMustacheTemplate("js/configuration/templates/game.mst", 'gameTemplate');
var spinnerTemplatePromise = fetchMustacheTemplate("js/common/templates/spinner.mst", 'spinnerTemplate');

if (DEV_ENV) {
    $(document).ready(function() {
        authObject = {
            "channelId": "test123",
            "clientId": "test123",
            // Token Contents, signed with "password123":
            // {
            //     "channel_id": "test123"
            // }
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsX2lkIjoidGVzdDEyMyJ9.kfCD7f2bKwBtdXJfhQbEzv5OZHqgRKbl6Qn8-1taqlA"
        };
        renderConfigPage();
    });
}

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    renderConfigPage();
});

function renderConfigPage() {
    if (loaded == true) {
        return;
    }
    loaded = true
    // TODO - reenable
    // renderPreview(authObject)

    // console.log('The JWT that will be passed to the EBS is', authObject.token);
    // console.log('The channel ID is', authObject.channelId);
    $('#saveBtn').prop("disabled", true)
    $("#saveBtn").attr('class', 'btn-disabled');
    $("#searchBtn").prop("disabled", true);
    $("#searchBtn").attr('class', 'btn-disabled');
    // Get previous settings
    // TODO - async
    $.ajax({
        type: "POST",
        url: DEV_ENV ? `${DEV_URL}/fetch` : `${PROD_URL}/fetch`,
        headers: {
            'x-extension-jwt': authObject.token,
        },
        dataType: "json",
        data: {},
        success: function(res) {
            $('#backendMessage').html(res.configMessage)
            savedData = res.data
            if (savedData != null) {
                restorePreviousSettings(savedData)
            }
            // Auto populate srcname with twitch name by default
            if (savedData == null && !DEV_ENV) {
                $.ajax({
                    type: "GET",
                    url: `https://api.twitch.tv/helix/users?id=${authObject.channelId}`,
                    headers: {
                        'Client-ID': authObject.clientId,
                        'Authorization': `Bearer ${authObject.token}`
                    },
                    success: function(userObject) {
                        $('#srcName').val(userObject.data[0].display_name)
                    }
                })
            }

            $('#saveBtn').prop("disabled", false)
            $("#saveBtn").attr('class', 'btn-warning');
            $("#searchBtn").prop("disabled", false);
            $("#searchBtn").attr('class', 'btn-primary');
        },
        error: function() {
            $('#saveBtn').prop("disabled", true); // TODO - This should be true... if we get back nothing they need to enter a valid SRC name.  This should have an error as well
            $("#saveBtn").attr('class', 'btn-warning');
            $("#searchBtn").prop("disabled", false);
            $("#searchBtn").attr('class', 'btn-primary');
        }
    });
}

function toggleButton(element, config) {
    config ? element.addClass('active'): element.removeClass('active');
}

function restorePreviousSettings(savedData) {

    var settings = JSON.parse(savedData.settings)
    var games = JSON.parse(savedData.games)
    srcID = savedData.srcID;
    srcName = savedData.srcName;

    injectSettings(settings)

    // Repopulate Game List
    for (var i = 0; i < games.length; i++) {
        var shouldExpand = false;
        // TODO get rid of this for loop, its useless..i think
        for (var k in games[i]) {
            if (k == 'shouldExpand' && games[i].hasOwnProperty(k)) {
                shouldExpand = games[i][k] == true;
            }
        }
        if (games[i].hasOwnProperty('categories') == false) {
            games[i]['categories'] = ["temp"]
            games[i]['categoryNames'] = ["re-find your games!"]
            games[i]['miscCategories'] = ["temp"]
            games[i]['miscCategoryNames'] = ["re-find your games!"]
        }
        if (games[i].hasOwnProperty('levels') == false) {
            games[i]['levels'] = ["temp"]
            games[i]['levelNames'] = ["re-find your games!"]
        }

        categories = []
        for (var j = 0; j < games[i].categories.length - games[i].miscCategoryNames.length; j++) {
            categories.push({
                name: games[i].categoryNames[j],
                id: games[i].categories[j],
                isMisc: false
            })
        }
        offset = (games[i].categories.length - games[i].miscCategoryNames.length)
        for (var j = 0; j < games[i].miscCategoryNames.length; j++) {
            categories.push({
                name: games[i].miscCategoryNames[j],
                id: games[i].categories[offset+j],
                isMisc: true
            })
        }
        levels = []
        for (var j = 0; j < games[i].levels.length; j++) {
            levels.push({
                name: games[i].levelNames[j],
                id: games[i].levels[j]
            })
        }

        var constructGameObj = {
            name: games[i].name,
            id: games[i].id,
            categories: categories,
            levels: levels
        }

        addGameToList(constructGameObj, false, shouldExpand)
    }
}

function setError(string) {
    $("#errorDialog").html(
        `<h3 class="config">${string}</h3>`
    )
}

var gameList = []
var ajaxCalls = []

function getGameName(url, gameID) {
    ajaxCalls.push($.getJSON(url, function(json) {
        game = json.data
        index = gameList.findIndex(x => x.id === gameID)
        gameList[index].name = game.names.international
    }))
}

function getCategories(url, gameID) {
    ajaxCalls.push($.getJSON(url, function(json) {
        categories = json.data
        index = gameList.findIndex(x => x.id === gameID)
        if (gameList[index].categories == null)
            gameList[index].categories = []
        for (let category of categories) {
            if (category.type != "per-level") {
                gameList[index].categories.push({
                    id: category.id,
                    name: category.name,
                    isMisc: category.miscellaneous == true
                })
            }
        }
    }))
}

function getLevels(url, gameID) {
    ajaxCalls.push($.getJSON(url, function(json) {
        levels = json.data
        index = gameList.findIndex(x => x.id === gameID)
        if (gameList[index].levels == null)
            gameList[index].levels = []
        for (let level of levels) {
            gameList[index].levels.push({
                id: level.id,
                name: level.name
            })
        }
    }))
}

function populateGameList(json) {

    personalBests = json.data
    for (let pb of personalBests) {
        // Not added yet
        if (gameList.findIndex(x => x.id === pb.run.game) <= -1) {
            gameList.push({
                id: pb.run.game,
                name: null
            })
        }
    }

    // TODO support pagination for people who have an absurd number of runs
    // Get the names for all the games we added
    for (let game of gameList) {
        getGameName(`https://www.speedrun.com/api/v1/games/${game.id}`, game.id)
        getCategories(`https://www.speedrun.com/api/v1/games/${game.id}/categories?orderby=name&max=200`, game.id)
        getLevels(`https://www.speedrun.com/api/v1/games/${game.id}/levels?orderby=name&max=200`, game.id)
    }

    $.when.apply(null, ajaxCalls).done(function() {
        ajaxCalls = []

        // Wipe Any Existing Games
        $("#gameList").html('')

        // Display The Games
        for (let game of gameList) {
            addGameToList(game, false, false)
        }
        // Disable the spinner
        $('.spinnerWrapper').remove();
        $('#saveBtn').prop("disabled", false)
        $("#saveBtn").attr('class', 'btn-warning');
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
    })
}

function segregateCategories(game) {
    var miscCategories = [];
    var filteredCategories = [];
    for (var i = 0; i < game.categories.length; i++) {
        if (game.categories[i].isMisc) {
            miscCategories.push(game.categories[i]);
        } else {
            filteredCategories.push(game.categories[i]);
        }
    }
    game.miscCategories = miscCategories;
    game.categories = filteredCategories;
}

async function addGameToList(game, removeBoxChecked, expandBoxChecked) {

    segregateCategories(game);

    await gameTemplatePromise;
    $('#gameList').append(Mustache.render(templates['gameTemplate'], {
        game: game,
        removeBoxChecked: removeBoxChecked ? "checked" : "",
        expandBoxChecked: expandBoxChecked ? "checked" : "",
        renderCategories: game.categories.length > 0,
        categories: game.categories,
        renderMiscCategories: game.miscCategories.length > 0 && $('#miscShow').hasClass('active') == true,
        miscCategoriesDisabled: game.miscCategories.length > 0 && $('#miscShow').hasClass('active') == false,
        miscCategories: $('#miscShow').hasClass('active') ? game.miscCategories : [],
        renderIndividualLevels: game.levels.length > 0 && $('#ilShow').hasClass('active') == true,
        individualLevelsDisabled: game.levels.length > 0 && $('#ilShow').hasClass('active') == false,
        individualLevels: $('#ilShow').hasClass('active') ? game.levels : []
    }));

    // Initialize Draggable / Sortable Rows
    $("ol.nav").sortable({
        group: 'nav',
        nested: false,
        vertical: false,
        exclude: '.divider-vertical',
        onDragStart: function ($item, container, _super) {
            $item.find('ol.dropdown-menu').sortable('disable');
            _super($item, container);
        },
        onDrop: function ($item, container, _super) {
            $item.find('ol.dropdown-menu').sortable('enable');
            _super($item, container);
        }
    });

    $("ol.dropdown-menu").sortable({
        group: 'nav'
    });

    $("#gameList").sortable({});
}

// TODO - embeds?
function getGameList() {
    $.ajax({
        url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
        dataType: "json",
        success: function(data) {
            populateGameList(data)
        }
    });
}

function printResults(json) {
    var data = json.data

    // No name found
    if (data.length <= 0) {
        setError("No one found on Speedrun.com by that name!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    // More than 1 result, not going to handle this, so be more specific please
    else if (data.length > 1) {
        setError("Found too many users by that name, be more specific!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }

    // K we are fine then, get the ID
    srcID = data[0].id;
    // Populate the game list
    getGameList();
}

function searchForUser(name) {
    $.ajax({
        url: `https://www.speedrun.com/api/v1/users?lookup=${name}`,
        dataType: "json",
        success: function(data) {
            printResults(data)
        }
    });
}

$("#searchBtn").click(function() {
    // Clean Potential Previous State
    $("#sortableGames").html('')
    srcID = null;
    gameList = []
    srcName = $("#srcName").val()

    // Disable the search button temporarily

    // vv lol wat?
    // TODO Disabled these lines temporarily due to 502 responses, these calls dont register as "done"
    // will need to look into this, for now just let people click as mcuh as they want as it shouldnt do anything negative

    $("#saveBtn").attr('class', 'btn-disabled');
    $('#saveBtn').prop("disabled", true)

    // TODO - spinner template
    $("#gameListingContainer").append(
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
        </section>`
    )
    $("#gamesHeader").html(
        `<h3 class="config">Game List (Reorderable and Toggleable)</h3><br>`
    )
    searchForUser($("#srcName").val())
})

$('#panelTitleBackgroundType').change(function() {
    value = $('#panelTitleBackgroundType').val().trim()
    // Clear Container
    $('#colorPickerContainer').html('')

    if (value == 'image') {
        // Do nothing, only got 1 image atm
    } else if (value == 'solid') {
        spawnSolidColorPicker('#ffffff')
    } else if (value == 'vGradient') {
        spawnGradientColorPicker("Top Color", "Bottom Color", '#ffffff', '#000000')
    } else {
        spawnGradientColorPicker("Left Color", "Right Color", '#ffffff', '#000000')
    }
})

$('#themeSelector').change(function() {
    value = $('#themeSelector').val().trim()
    if (value == 'default') {
        injectSettings(defaultTheme)
    }
})

function spawnSolidColorPicker(color1) {
    $('#colorPickerContainer').append(
        `<div>
            Panel Title Background Color
            <input type="color" value="${color1}" id="solidBackgroundColor">
        </div>`
    )
}

function spawnGradientColorPicker(label1, label2, color1, color2) {
    $('#colorPickerContainer').append(
        `<div>
            ${label1}
            <input type="color" value="${color1}" id="gradientColor1">
        </div>
        <div>
            ${label2}
            <input type="color" value="${color2}" id="gradientColor2">
        </div>`
    )
}

$("#saveBtn").click(function() {

    // Check to see if we can actually save or not
    if (gameList == []) {
        setError("ERROR: There are no Games Selected!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    if (srcID == null) {
        setError("ERROR: No Speedrun.com Name Choosen")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    if ($('#panelTitle').val() == "") {
        setError("ERROR: No title given to panel!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    $("#errorDialog").html('')

    settings = extractSettings()

    gamesToSend = []
    $('#gameList').find('.game').each(function() {
        var currentGame = $(this)
        var checkbox = currentGame.find('.displayBox')
        if (checkbox.is(':checked') == false) {
            // Then we will add the game
            // categories and misc are seperated visually, but SRC API wise, they are handled
            // the same, so makes no sense to separate for our purposes
            categories = []
            categoryNames = []
            miscCategoryNames = []
            levels = []
            levelNames = []
            $(currentGame).find('.categoryList').each(function() {
                $(this).find('.optionRow').each(function() {
                    name = ""
                    $(this).find('p').each(function() {
                        name = $(this).text().trim()
                    })
                    info = $(this).find('input')
                    if (info.is(':checked')) {
                        categories.push(info.val().trim())
                        categoryNames.push(name)
                    }
                })
            })
            $(currentGame).find('.miscList').each(function() {
                $(this).find('.optionRow').each(function() {
                    name = ""
                    $(this).find('p').each(function() {
                        name = $(this).text().trim()
                    })
                    info = $(this).find('input')
                    if (info.is(':checked')) {
                        categories.push(info.val().trim())
                        miscCategoryNames.push(name)
                    }
                })
            })
            $(currentGame).find('.levelList').each(function() {
                $(this).find('.optionRow').each(function() {
                    name = ""
                    $(this).find('p').each(function() {
                        name = $(this).text().trim()
                    })
                    info = $(this).find('input')
                    if (info.is(':checked')) {
                        levels.push(info.val().trim())
                        levelNames.push(name)
                    }
                })
            })
            gamesToSend.push({
                name: currentGame.find('.gameTitleBox').val().trim(),
                id: checkbox.val().trim(),
                shouldExpand: currentGame.find('.expandBox').is(':checked'),
                categories: categories,
                categoryNames: categoryNames,
                miscCategoryNames: miscCategoryNames,
                levels: levels,
                levelNames: levelNames
            })
        }
    })
    sendResult(gamesToSend, settings)
});

function sendResult(gamesToSend, settings) {
    $.ajax({
        type: "POST",
        url: DEV_ENV ? "http://localhost:8081/save" : "https://extension.xtvaser.xyz/save",
        headers: {
            'x-extension-jwt': authObject.token,
        },
        dataType: "json",
        data: {
            settings: JSON.stringify(settings),
            srcID: srcID,
            srcName: srcName,
            games: JSON.stringify(gamesToSend)
        },
        success: function(res) {
            if (res.status == 501) {
                setError("Saving Error: Database Error, Contact Extension Developer")
            } else {
                setError("SUCCESS: Saved Successfully!")

                // TODO - reenable
                // renderPreview(authObject)
            }
        },
        error: function() {
            setError("ERROR: An Unexpected Error Occurred, Contact Extension Developer")
        }
    });
}

document.getElementById('exportSettings').onclick = function(){
    var blob = new Blob([JSON.stringify(extractSettings())], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "src-ext-backup-settings.json");
}

document.getElementById('importSettings').onchange = function(){
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function(progressEvent){
    // Entire file
    var jsonString = this.result;
    try {
        settings = JSON.parse(jsonString);
        injectSettings(settings)
    }
    catch (e) {
        setError("ERROR: Invalid/Outdated Settings File!")
    }
    };
    reader.readAsText(file);
};
