/// Config Page for Frontend
var authObject = null;
var srcID = null;
var srcName = null;

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    renderPreview(authObject)
    // console.log('The JWT that will be passed to the EBS is', authObject.token);
    // console.log('The channel ID is', authObject.channelId);
    $('#saveBtn').prop("disabled", true)
    $("#saveBtn").attr('class', 'btn-disabled');
    $("#searchBtn").prop("disabled", true);
    $("#searchBtn").attr('class', 'btn-disabled');
    // Get previous settings
    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/fetch",
        headers: {
            'x-extension-jwt': auth.token,
        },
        dataType: "json",
        data: {},
        success: function(res) {
            savedData = res.data
            if (savedData != null) {
                restorePreviousSettings(savedData)
            }
            // Auto populate srcname with twitch name by default
            if (savedData == null) {
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
            $('#saveBtn').prop("disabled", false)
            $("#saveBtn").attr('class', 'btn-warning');
            $("#searchBtn").prop("disabled", false);
            $("#searchBtn").attr('class', 'btn-primary');
        }
    });
});

function injectSettings(settings) {
    // Restore All Settings
    $('#panelTitle').val(settings.title)
    $('#srcName').val(srcName)
    $('#panelTitleBackgroundType').val(settings.panelTitleBackgroundType)
    if (settings.panelTitleBackgroundType == 'image') {
        // Do nothing, only got 1 image atm
    } else if (settings.panelTitleBackgroundType == 'solid') {
        spawnSolidColorPicker(settings.panelTitleBackgroundColor1)
    } else if (settings.panelTitleBackgroundType == 'vGradient') {
        spawnGradientColorPicker("Top Color", "Bottom Color", settings.panelTitleBackgroundColor1, settings.panelTitleBackgroundColor2)
    } else {
        spawnGradientColorPicker("Left Color", "Right Color", settings.panelTitleBackgroundColor1, settings.panelTitleBackgroundColor2)
    }
    $('#panelTitleDividerColor').val(settings.panelTitleDivColor)
    $('#gameTitleDividerColor').val(settings.gameTitleDivColor)
    if (settings.panelBackgroundColor != undefined) {
        $('#panelBackgroundColor').val(settings.panelBackgroundColor)
    }
    $('#wrRainbow').prop('checked', settings.wrRainbow == true);
    // misc settings
    if (settings.miscShow != undefined && settings.miscSep != undefined) {
        $('#miscShow').prop('checked', settings.miscShow == true);
        $('#miscSep').prop('checked', settings.miscSep == true);
    }
    // il settings
    if (settings.ilShow != undefined && settings.ilSep != undefined) {
        $('#ilShow').prop('checked', settings.ilShow == true);
        $('#ilSep').prop('checked', settings.ilSep == true);
    }
    $('#titleShadow').prop('checked', settings.panelTitleShadow == true);
    $('#panelTitleHeight').val(settings.panelTitleHeight)
    $('#panelTitleFontBold').prop('checked', settings.panelTitleFontBold == true);
    $('#panelTitleFontItalic').prop('checked', settings.panelTitleFontItalic == true);
    $('#panelTitleFontSize').val(settings.panelTitleFontSize)
    $('#panelTitleFontColor').val(settings.panelTitleFontColor)
    $('#panelTitleFont').val(settings.panelTitleFont)
    $('#panelHeaderFontBold').prop('checked', settings.panelHeaderFontBold == true);
    $('#panelHeaderFontItalic').prop('checked', settings.panelHeaderFontItalic == true);
    $('#panelHeaderFontSize').val(settings.panelHeaderFontSize)
    $('#panelHeaderFontColor').val(settings.panelHeaderFontColor)
    $('#panelHeaderFont').val(settings.panelHeaderFont)
    $('#gameTitleFontBold').prop('checked', settings.gameTitleFontBold == true);
    $('#gameTitleFontItalic').prop('checked', settings.gameTitleFontItalic == true);
    $('#gameTitleFontSize').val(settings.gameTitleFontSize)
    $('#gameTitleFontColor').val(settings.gameTitleFontColor)
    $('#gameTitleFont').val(settings.gameTitleFont)
    $('#gameCategoryFontBold').prop('checked', settings.gameCategoryFontBold == true);
    $('#gameCategoryFontItalic').prop('checked', settings.gameCategoryFontItalic == true);
    $('#gameCategoryFontSize').val(settings.gameCategoryFontSize)
    $('#gameCategoryFontColor').val(settings.gameCategoryFontColor)
    $('#gameCategoryFont').val(settings.gameCategoryFont)
    $('#pbFontBold').prop('checked', settings.pbFontBold == true);
    $('#pbFontItalic').prop('checked', settings.pbFontItalic == true);
    $('#pbFontSize').val(settings.pbFontSize)
    $('#pbFontColor').val(settings.pbFontColor)
    $('#pbFont').val(settings.pbFont)
    if (settings.timeHeaderFontBold != undefined && settings.timeHeaderFontItalic != undefined &&
        settings.timeHeaderFontSize != undefined && settings.timeHeaderFontColor != undefined &&
        settings.timeHeaderFont != undefined) {
        $('#timeHeaderFontBold').prop('checked', settings.timeHeaderFontBold == true);
        $('#timeHeaderFontItalic').prop('checked', settings.timeHeaderFontItalic == true);
        $('#timeHeaderFontSize').val(settings.timeHeaderFontSize)
        $('#timeHeaderFontColor').val(settings.timeHeaderFontColor)
        $('#timeHeaderFont').val(settings.timeHeaderFont)
    }
}

function restorePreviousSettings(savedData) {

    var settings = JSON.parse(savedData.settings)
    var games = JSON.parse(savedData.games)
    srcID = savedData.srcID;
    srcName = savedData.srcName;

    injectSettings(settings)

    // Repopulate Game List
    for (var i = 0; i < games.length; i++) {
        var shouldExpand
        // TODO get rid of this for loop, its useless
        for (var k in games[i]) {
            if (k == 'shouldExpand' && games[i].hasOwnProperty(k)) {
                if (games[i][k] == true) {
                    shouldExpand = 'checked'
                } else {
                    shouldExpand = ''
                }
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

        addGameToList(constructGameObj, '', shouldExpand)
    }
}

function setError(string) {
    $("#errorDialog").html(
        `<h3 class="config">${string}</h3>`
    )
}

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

var gameList = []
var ajaxCalls = []

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
            addGameToList(game, '', '')
        }
        // Disable the spinner
        $('.spinnerWrapper').remove();
        $('#saveBtn').prop("disabled", false)
        $("#saveBtn").attr('class', 'btn-warning');
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
    })
}

function addGameToList(game, removeBox, expandBox) {

    tempGameList = 
        `<li class="ui-sortable-handle">
            <div class="row">
                <nav class="navbar navbar-default game">
                    <div class="container-fluid">
                        <ul class="nav navbar-nav gameOptionContainer">
                            <li>
                                <input type="text" value="${game.name}" class="gameTitleBox">
                            </li>
                        <li class="dropdown optionList">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="">Options
                                <span class="caret"></span>
                            </a>
                            <ol class="dropdown-menu ui-sortable">
                                <li>
                                    <div class="row optionRow">
                                        <div class="col-md-8">
                                            <p>Remove Game</p>
                                        </div>
                                        <div class="col-md-4 selectionContainer">
                                            <input type=checkbox value="${game.id}" class="displayBox" ${removeBox}>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="row optionRow">
                                        <div class="col-md-8">
                                            <p>Initially Expand Game</p>
                                        </div>
                                        <div class="col-md-4 selectionContainer">
                                            <input type="checkbox" class="expandBox" ${expandBox}>
                                        </div>
                                    </div>
                                </li>
                            </ol>
                        </li>
                        <li class="dropdown categoryList">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="">Categories
                                <span class="caret"></span>
                            </a>
                            <ol class="dropdown-menu">`
    // Add Categories
    if (game.categories.length == 0) {
        tempGameList += 
        `<li>
            <div class="row optionRow">
                <div class="col-md-8">
                    <p>No Categories</p>
                </div>
            </div>
        </li>`
    }
    for (var i = 0; i < game.categories.length; i++) {
        category = game.categories[i]
        if (category.isMisc == false) {
            tempGameList += 
                `<li>
                    <div class="row optionRow">
                        <div class="col-md-8">
                            <p>${category.name}</p>
                        </div>
                        <div class="col-md-4 selectionContainer">
                            <input type=checkbox value="${category.id}" checked>
                        </div>
                    </div>
                </li>`
        }
    }
    tempGameList +=
        `       </ol>
            </li>
        <li class="dropdown miscList">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="">Misc.
                <span class="caret"></span>
            </a>
            <ol class="dropdown-menu">`
    // Add Miscellaneous Categories
    miscCount = 0
    for (var i = 0; i < game.categories.length; i++) {
        category = game.categories[i]
        // If they are toggled off, display that
        if ($('#miscShow').is(':checked') == false) {
            tempGameList += 
            `<li>
                <div class="row optionRow">
                    <div class="col-md-8">
                        <p>Misc. Disabled!</p>
                    </div>
                </div>
            </li>`
            miscCount += 1
            break;
        }
        if (category.isMisc) {
            miscCount += 1
            tempGameList += 
                `<li>
                    <div class="row optionRow">
                        <div class="col-md-8">
                            <p>${category.name}</p>
                        </div>
                        <div class="col-md-4 selectionContainer">
                            <input type=checkbox value="${category.id}" checked>
                        </div>
                    </div>
                </li>`
        }
    }
    if (miscCount == 0) {
        tempGameList += 
        `<li>
            <div class="row optionRow">
                <div class="col-md-8">
                    <p>No Misc. Cats.</p>
                </div>
            </div>
        </li>`
    }
    tempGameList += 
        `       </ol>
            </li>
        <li class="dropdown levelList">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="">Levels
                <span class="caret"></span>
            </a>
            <ol class="dropdown-menu">`
    // Add Levels
    if (game.levels.length == 0) {
        tempGameList += 
        `<li>
            <div class="row optionRow">
                <div class="col-md-8">
                    <p>No Levels</p>
                </div>
            </div>
        </li>`
    }
    for (var i = 0; i < game.levels.length; i++) {
        level = game.levels[i]
        if ($('#ilShow').is(':checked') == false) {
            tempGameList += 
            `<li>
                <div class="row optionRow">
                    <div class="col-md-8">
                        <p>ILs Disabled!</p>
                    </div>
                </div>
            </li>`
            break;
        }
        
        tempGameList += 
            `<li>
                <div class="row optionRow">
                    <div class="col-md-8">
                        <p>${level.name}</p>
                    </div>
                    <div class="col-md-4 selectionContainer">
                        <input type=checkbox value="${level.id}" checked>
                    </div>
                </div>
            </li>`
    }
    tempGameList +=
        `       </ol>
            </li>
        <li class="fa-config">
            <i class="fas fa-bars" aria-hidden="true"></i>
        </li>
        </ul>
        </div>
        </nav>
        </div>
        </li>
        </ol>
        </div>`
    $("#gameList").append(tempGameList)
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
    
    $("#gameList").sortable({
    
    });
}

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
    $("#searchBtn").prop("disabled", true);
    $("#searchBtn").attr('class', 'btn-disabled');
    $("#saveBtn").attr('class', 'btn-disabled');
    $('#saveBtn').prop("disabled", true)

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

function extractSettings() {
    settings = {}
    settings.theme = "stub" //$('#panelTheme').val()
    settings.title = $('#panelTitle').val()
    // panel title background
    settings.panelTitleDivColor = $('#panelTitleDividerColor').val()
    settings.gameTitleDivColor = $('#gameTitleDividerColor').val()
    // panel background color
    settings.panelBackgroundColor = $('#panelBackgroundColor').val()
    // wr cycling
    settings.wrRainbow = $('#wrRainbow').is(':checked')
    // hide WR Column
    settings.hideWR = $('#hideWR').is(':checked')
    // misc settings
    settings.miscShow = $('#miscShow').is(':checked')
    settings.miscSep = $('#miscSep').is(':checked')
    // il settings
    settings.ilShow = $('#ilShow').is(':checked')
    settings.ilSep = $('#ilSep').is(':checked')
    // panel title shadow
    settings.panelTitleShadow = $('#titleShadow').is(':checked')
    // height of panel title
    settings.panelTitleHeight = $('#panelTitleHeight').val()
    titleBackgroundType = $('#panelTitleBackgroundType').val().trim()
    if (titleBackgroundType == 'solid') {
        settings.panelTitleBackgroundType = 'solid'
        settings.panelTitleBackgroundColor1 = $('#solidBackgroundColor').val()
    } else if (titleBackgroundType == 'vGradient') {
        settings.panelTitleBackgroundType = 'vGradient'
        settings.panelTitleBackgroundColor1 = $('#gradientColor1').val()
        settings.panelTitleBackgroundColor2 = $('#gradientColor2').val()
    } else if (titleBackgroundType == 'hGradient') {
        settings.panelTitleBackgroundType = 'hGradient'
        settings.panelTitleBackgroundColor1 = $('#gradientColor1').val()
        settings.panelTitleBackgroundColor2 = $('#gradientColor2').val()
    } else {
        settings.panelTitleBackgroundType = 'image'
    }
    // Panel Title Font
    settings.panelTitleFontBold = $('#panelTitleFontBold').is(':checked')
    settings.panelTitleFontItalic = $('#panelTitleFontItalic').is(':checked')
    settings.panelTitleFontSize = $('#panelTitleFontSize').val()
    settings.panelTitleFontColor = $('#panelTitleFontColor').val()
    settings.panelTitleFont = $('#panelTitleFont').val()
    // Panel Header Font
    settings.panelHeaderFontBold = $('#panelHeaderFontBold').is(':checked')
    settings.panelHeaderFontItalic = $('#panelHeaderFontItalic').is(':checked')
    settings.panelHeaderFontSize = $('#panelHeaderFontSize').val()
    settings.panelHeaderFontColor = $('#panelHeaderFontColor').val()
    settings.panelHeaderFont = $('#panelHeaderFont').val()
    // Game Title Font
    settings.gameTitleFontBold = $('#gameTitleFontBold').is(':checked')
    settings.gameTitleFontItalic = $('#gameTitleFontItalic').is(':checked')
    settings.gameTitleFontSize = $('#gameTitleFontSize').val()
    settings.gameTitleFontColor = $('#gameTitleFontColor').val()
    settings.gameTitleFont = $('#gameTitleFont').val()
    // Game Category Font
    settings.gameCategoryFontBold = $('#gameCategoryFontBold').is(':checked')
    settings.gameCategoryFontItalic = $('#gameCategoryFontItalic').is(':checked')
    settings.gameCategoryFontSize = $('#gameCategoryFontSize').val()
    settings.gameCategoryFontColor = $('#gameCategoryFontColor').val()
    settings.gameCategoryFont = $('#gameCategoryFont').val()
    // WR/PB Info Font
    settings.pbFontBold = $('#pbFontBold').is(':checked')
    settings.pbFontItalic = $('#pbFontItalic').is(':checked')
    settings.pbFontSize = $('#pbFontSize').val()
    settings.pbFontColor = $('#pbFontColor').val()
    settings.pbFont = $('#pbFont').val()
    // Time Header Font
    settings.timeHeaderFontBold = $('#timeHeaderFontBold').is(':checked')
    settings.timeHeaderFontItalic = $('#timeHeaderFontItalic').is(':checked')
    settings.timeHeaderFontSize = $('#timeHeaderFontSize').val()
    settings.timeHeaderFontColor = $('#timeHeaderFontColor').val()
    settings.timeHeaderFont = $('#timeHeaderFont').val()
    return settings
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
        url: "https://extension.xtvaser.xyz/save",
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
                renderPreview(authObject)
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
