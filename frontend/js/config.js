/// Config Page for Frontend
var loaded = false;

var authObject = null;
var srcID = null;
var srcName = null;

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    if (loaded == true) {
        return;
    }
    loaded = true
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
            $('#backendMessage').html(res.configMessage)
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

function toggleButton(element, config) {
    if (!config) {
        element.removeClass('active')
    }
    else {
        element.addClass('active')
    }
}

// Restore All Configuration Settings
function injectSettings(settings) {
    $('#panelTitle').val(settings.title)
    $('#srcName').val(srcName)
    // TODO theme preset
    // Panel Title Background Settings
    $('#panelTitleHeight').bootstrapSlider('setValue', settings.panelTitleHeight)
    toggleButton($('#panelTitleShadow'), settings.panelTitleTextShadow)
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
    
    // Panel Title Settings
    toggleButton($('#panelTitleFontBold'), settings.panelTitleFontBold)
    toggleButton($('#panelTitleFontItalic'), settings.panelTitleFontItalic)
    $('#panelTitleFontSize').bootstrapSlider('setValue', settings.panelTitleFontSize)
    $('#panelTitleFontColor').val(settings.panelTitleFontColor)
    if (!settings.hasOwnProperty('panelTitleFontFamily')) {
        dropSecond = settings.panelTitleFont.split(',')[0]
        settings.panelTitleFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $('#panelTitleFontFamily').val(settings.panelTitleFontFamily)
    if (settings.hasOwnProperty('panelTitleHeightPercentage')) {
        $('#panelTitleHeightPercentage').bootstrapSlider('setValue', settings.panelTitleHeightPercentage)
    }
    toggleButton($('#titleShadow'), settings.panelTitleShadow)

    // Category Header Settings
    // Deprecation of panelHeaderFont
    if (!settings.hasOwnProperty('categoryHeaderFontBold')) {
        settings.categoryHeaderFontBold = settings.pbHeaderFontBold = settings.wrHeaderFontBold = settings.panelHeaderFontBold
        settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.panelHeaderFontItalic
        settings.categoryHeaderFontSize = settings.categoryHeaderFontItalic = settings.categoryHeaderFontItalic = settings.panelHeaderFontSize
        settings.categoryHeaderFontColor = settings.categoryHeaderFontColor = settings.categoryHeaderFontColor = settings.panelHeaderFontColor
        dropSecond = settings.panelHeaderFont.split(',')[0]
        settings.categoryHeaderFontFamily = settings.pbHeaderFontFamily = settings.wrHeaderFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    // those values will be the default for these if none exists
    toggleButton($('#categoryHeaderFontBold'), settings.categoryHeaderFontBold)
    toggleButton($('#categoryHeaderFontItalic'), settings.categoryHeaderFontItalic)
    $('#categoryHeaderFontSize').bootstrapSlider('setValue', settings.categoryHeaderFontSize)
    $('#categoryHeaderFontColor').val(settings.categoryHeaderFontColor)
    $('#categoryHeaderFontFamily').val(settings.categoryHeaderFontFamily)

    // Personal Best Header Settings
    toggleButton($('#pbHeaderFontBold'), settings.pbHeaderFontBold)
    toggleButton($('#pbHeaderFontItalic'), settings.pbHeaderFontItalic)
    $('#pbHeaderFontSize').bootstrapSlider('setValue', settings.pbHeaderFontSize)
    $('#pbHeaderFontColor').val(settings.pbHeaderFontColor)
    $('#pbHeaderFontFamily').val(settings.pbHeaderFontFamily)

    // World Record Header Settings
    toggleButton($('#wrHeaderFontBold'), settings.wrHeaderFontBold)
    toggleButton($('#wrHeaderFontItalic'), settings.wrHeaderFontItalic)
    $('#wrHeaderFontSize').bootstrapSlider('setValue', settings.wrHeaderFontSize)
    $('#wrHeaderFontColor').val(settings.wrHeaderFontColor)
    $('#wrHeaderFontFamily').val(settings.wrHeaderFontFamily)
    toggleButton($('#hideWR'), settings.hideWR)
    toggleButton($('#wrRainbow'), settings.wrRainbow)

    // Panel Title Divider Settings
    if (settings.hasOwnProperty('panelTitleDividerHeight')) {
        $('#panelTitleDividerHeight').bootstrapSlider('setValue', settings.panelTitleDivHeight)
        $('#panelTitleDividerColor').val(settings.panelTitleDivColor)
        $('#panelTitleDividerBottomMargin').bootstrapSlider('setValue', settings.panelTitleDivBottomMargin)
    }

    // Game Title Settings
    toggleButton($('#gameTitleFontBold'), settings.gameTitleFontBold)
    toggleButton($('#gameTitleFontItalic'), settings.gameTitleFontItalic)
    $('#gameTitleFontSize').bootstrapSlider('setValue', settings.gameTitleFontSize)
    $('#gameTitleFontColor').val(settings.gameTitleFontColor)
    if (!settings.hasOwnProperty('gameTitleFontFamily')) {
        dropSecond = settings.gameTitleFont.split(',')[0]
        settings.gameTitleFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $('#gameTitleFontFamily').val(settings.gameTitleFontFamily)

    // Expand / Collapse Icon Settings
    if (settings.hasOwnProperty('expandContractColor')) {
        $('#expandContractColor').val(settings.expandContractColor)
    }

    // Category Name Settings
    toggleButton($('#gameCategoryFontBold'), settings.gameCategoryFontBold)
    toggleButton($('#gameCategoryFontItalic'), settings.gameCategoryFontItalic)
    $('#gameCategoryFontSize').bootstrapSlider('setValue', settings.gameCategoryFontSize)
    $('#gameCategoryFontColor').val(settings.gameCategoryFontColor)
    if (!settings.hasOwnProperty('gameCategoryFontFamily')) {
        dropSecond = settings.gameCategoryFont.split(',')[0]
        settings.gameCategoryFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $('#gameCategoryFontFamily').val(settings.gameCategoryFontFamily)
    if (settings.hasOwnProperty('gameCategoryBottomMargin')) {
        $('#gameCategoryBottomMargin').bootstrapSlider('setValue', settings.gameCategoryBottomMargin)
    }

    // Personal Best Time Settings
    toggleButton($('#pbFontBold'), settings.pbFontBold)
    toggleButton($('#pbFontItalic'), settings.pbFontItalic)
    $('#pbFontSize').bootstrapSlider('setValue', settings.pbFontSize)
    $('#pbFontColor').val(settings.pbFontColor)
    if (!settings.hasOwnProperty('pbFontFamily')) {
        dropSecond = settings.pbFont.split(',')[0]
        settings.pbFontFamily = dropSecond.substring(1, dropSecond.length-1)
    }
    $('#pbFontFamily').val(settings.pbFontFamily)

    // World Record Time Settings
    if (!settings.hasOwnProperty('wrFontBold')) {
        settings.wrFontBold = settings.pbFontBold
        settings.wrFontItalic = settings.pbFontItalic
        settings.wrFontColor = '#f3e221'
        settings.wrFontFamily = settings.pbFontFamily
    }
    toggleButton($('#wrFontBold'), settings.wrFontBold)
    toggleButton($('#wrFontItalic'), settings.wrFontItalic)
    $('#wrFontSize').bootstrapSlider('setValue', settings.wrFontSize)
    $('#wrFontColor').val(settings.wrFontColor)
    $('#wrFontFamily').val(settings.wrFontFamily)

    // Miscellaneous Header Settings
    if (!settings.hasOwnProperty('miscHeaderFontBold')) {
        settings.miscHeaderFontBold = settings.ilHeaderFontBold = settings.timeHeaderFontBold
        settings.miscHeaderFontBold = settings.ilHeaderFontItalic = settings.timeHeaderFontItalic
        settings.miscHeaderFontSize = settings.ilHeaderFontSize = settings.timeHeaderFontSize
        settings.miscHeaderFontColor = settings.ilHeaderFontColor = settings.timeHeaderFontColor
        dropSecond = settings.timeHeaderFont.split(',')[0]
        settings.miscHeaderFontFamily = settings.ilHeaderFontFamily = dropSecond.substring(1, dropSecond.length-1)
        settings.miscHeaderBottomMargin = settings.ilHeaderBottomMargin = 0
    }
    toggleButton($('#miscHeaderFontBold'), settings.miscHeaderFontBold)
    toggleButton($('#miscHeaderFontItalic'), settings.miscHeaderFontItalic)
    $('#miscHeaderFontSize').bootstrapSlider('setValue', settings.miscHeaderFontSize)
    $('#miscHeaderFontColor').val(settings.miscHeaderFontColor)
    $('#miscHeaderFontFamily').val(settings.miscHeaderFontFamily)
    $('#miscHeaderBottomMargin').bootstrapSlider('setValue', settings.miscHeaderBottomMargin)
    if (settings.miscShow != undefined && settings.miscSep != undefined) {
        toggleButton($('#miscShow'), settings.miscShow)
        toggleButton($('#miscSep'), settings.miscSep)
    }

    // Individual Level Header Settings
    toggleButton($('#ilHeaderFontBold'), settings.ilHeaderFontBold)
    toggleButton($('#ilHeaderFontItalic'), settings.ilHeaderFontItalic)
    $('#ilHeaderFontSize').bootstrapSlider('setValue', settings.ilHeaderFontSize)
    $('#ilHeaderFontColor').val(settings.ilHeaderFontColor)
    $('#ilHeaderFontFamily').val(settings.ilHeaderFontFamily)
    $('#ilHeaderBottomMargin').bootstrapSlider('setValue', settings.ilHeaderBottomMargin)
    if (settings.ilShow != undefined && settings.ilSep != undefined) {
        toggleButton($('#ilShow'), settings.ilShow)
        toggleButton($('#ilSep'), settings.ilSep)
    }

    // Game Divider Settings
    if (settings.hasOwnProperty('gameDividerHeight')) {
        $('#gameDividerHeight').bootstrapSlider('setValue', settings.gameDivHeight)
        $('#gameDividerColor').val(settings.gameDivColor)
        $('#gameDividerBottomMargin').bootstrapSlider('setValue', settings.gameDivBottomMargin)
    }

    // Panel Background Settings
    if (settings.panelBackgroundColor != undefined) {
        $('#panelBackgroundColor').val(settings.panelBackgroundColor)
    }
    // Scrollbar Settings
    if (settings.hasOwnProperty('scrollbarWidth')) {
        $('#scrollbarWidth').bootstrapSlider('setValue', settings.scrollbarWidth)
        $('#scrollbarOpacity').bootstrapSlider('setValue', settings.scrollbarOpacity)
        $('#scrollbarColor').val(settings.scrollbarColor)
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
        if ($('#miscShow').hasClass('active') == false) {
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
        if ($('#ilShow').hasClass('active') == false) {
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
    // TODO Disabled these lines temporarily due to 502 responses, these calls dont register as "done"
    // will need to look into this, for now just let people click as mcuh as they want as it shouldnt do anything negative
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
    settings.title = $('#panelTitle').val()
    // Panel Title Background Settings
    settings.panelTitleHeight = "" + $('#panelTitleHeight').bootstrapSlider('getValue')
    settings.panelTitleTextShadow = $('#panelTitleShadow').hasClass('active')
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
    
    // Panel Title Settings
    settings.panelTitleFontBold = $('#panelTitleFontBold').hasClass('active')
    settings.panelTitleFontItalic = $('#panelTitleFontItalic').hasClass('active')
    settings.panelTitleFontSize = "" + $('#panelTitleFontSize').bootstrapSlider('getValue')
    settings.panelTitleFontColor = $('#panelTitleFontColor').val()
    settings.panelTitleFontFamily = $('#panelTitleFontFamily').val().trim()
    settings.panelTitleHeightPercentage = "" + $('#panelTitleHeightPercentage').bootstrapSlider('getValue')
    settings.panelTitleShadow = $('#titleShadow').hasClass('active')

    // Category Header Settings
    // TODO deprecation for #panelHeaderFontX
    // those values will be the default for these if none exists
    settings.categoryHeaderFontBold = $('#categoryHeaderFontBold').hasClass('active')
    settings.categoryHeaderFontItalic = $('#categoryHeaderFontItalic').hasClass('active')
    settings.categoryHeaderFontSize = "" + $('#categoryHeaderFontSize').bootstrapSlider('getValue')
    settings.categoryHeaderFontColor = $('#categoryHeaderFontColor').val()
    settings.categoryHeaderFontFamily = $('#categoryHeaderFontFamily').val().trim()

    // Personal Best Header Settings
    settings.pbHeaderFontBold = $('#pbHeaderFontBold').hasClass('active')
    settings.pbHeaderFontItalic = $('#pbHeaderFontItalic').hasClass('active')
    settings.pbHeaderFontSize = "" + $('#pbHeaderFontSize').bootstrapSlider('getValue')
    settings.pbHeaderFontColor = $('#pbHeaderFontColor').val()
    settings.pbHeaderFontFamily = $('#pbHeaderFontFamily').val().trim()

    // World Record Header Settings
    settings.wrHeaderFontBold = $('#wrHeaderFontBold').hasClass('active')
    settings.wrHeaderFontItalic = $('#wrHeaderFontItalic').hasClass('active')
    settings.wrHeaderFontSize = "" + $('#wrHeaderFontSize').bootstrapSlider('getValue')
    settings.wrHeaderFontColor = $('#wrHeaderFontColor').val()
    settings.wrHeaderFontFamily = $('#wrHeaderFontFamily').val().trim()
    settings.hideWR = $('#hideWR').hasClass('active')
    settings.wrRainbow = $('#wrRainbow').hasClass('active')

    // Panel Title Divider Settings
    // TODO new settings here
    settings.panelTitleDivHeight = "" + $('#panelTitleDividerHeight').bootstrapSlider('getValue')
    settings.panelTitleDivColor = $('#panelTitleDividerColor').val()
    settings.panelTitleDivBottomMargin = "" + $('#panelTitleDividerBottomMargin').bootstrapSlider('getValue')

    // Game Title Settings
    settings.gameTitleFontBold = $('#gameTitleFontBold').hasClass('active')
    settings.gameTitleFontItalic = $('#gameTitleFontItalic').hasClass('active')
    settings.gameTitleFontSize = "" + $('#gameTitleFontSize').bootstrapSlider('getValue')
    settings.gameTitleFontColor = $('#gameTitleFontColor').val()
    settings.gameTitleFontFamily = $('#gameTitleFontFamily').val().trim()

    // Expand / Collapse Icon Settings
    // TODO new
    settings.expandContractColor = $('#expandContractColor').val()

    // Category Name Settings
    // TODO has a new option with margin
    settings.gameCategoryFontBold = $('#gameCategoryFontBold').hasClass('active')
    settings.gameCategoryFontItalic = $('#gameCategoryFontItalic').hasClass('active')
    settings.gameCategoryFontSize = "" + $('#gameCategoryFontSize').bootstrapSlider('getValue')
    settings.gameCategoryFontColor = $('#gameCategoryFontColor').val()
    settings.gameCategoryFontFamily = $('#gameCategoryFontFamily').val().trim()
    settings.gameCategoryBottomMargin = "" + $('#gameCategoryBottomMargin').bootstrapSlider('getValue')

    // Personal Best Time Settings
    settings.pbFontBold = $('#pbFontBold').hasClass('active')
    settings.pbFontItalic = $('#pbFontItalic').hasClass('active')
    settings.pbFontSize = "" + $('#pbFontSize').bootstrapSlider('getValue')
    settings.pbFontColor = $('#pbFontColor').val()
    settings.pbFontFamily = $('#pbFontFamily').val().trim()

    // World Record Time Settings
    // TODO these are new, use pb options as default if not present
    settings.wrFontBold = $('#wrFontBold').hasClass('active')
    settings.wrFontItalic = $('#wrFontItalic').hasClass('active')
    settings.wrFontSize = "" + $('#wrFontSize').bootstrapSlider('getValue')
    settings.wrFontColor = $('#wrFontColor').val()
    settings.wrFontFamily = $('#wrFontFamily').val().trim()

    // Miscellaneous Header Settings
    // TODO deprecation, used to use just timeHeader for everything
    settings.miscHeaderFontBold = $('#miscHeaderFontBold').hasClass('active')
    settings.miscHeaderFontItalic = $('#miscHeaderFontItalic').hasClass('active')
    settings.miscHeaderFontSize = "" + $('#miscHeaderFontSize').bootstrapSlider('getValue')
    settings.miscHeaderFontColor = $('#miscHeaderFontColor').val()
    settings.miscHeaderFontFamily = $('#miscHeaderFontFamily').val().trim()
    settings.miscHeaderBottomMargin = "" + $('#miscHeaderBottomMargin').bootstrapSlider('getValue')
    settings.miscShow = $('#miscShow').hasClass('active')
    settings.miscSep = $('#miscSep').hasClass('active')

    // Individual Level Header Settings
    // TODO deprecation for the same reason as above
    settings.ilHeaderFontBold = $('#ilHeaderFontBold').hasClass('active')
    settings.ilHeaderFontItalic = $('#ilHeaderFontItalic').hasClass('active')
    settings.ilHeaderFontSize = "" + $('#ilHeaderFontSize').bootstrapSlider('getValue')
    settings.ilHeaderFontColor = $('#ilHeaderFontColor').val()
    settings.ilHeaderFontFamily = $('#ilHeaderFontFamily').val().trim()
    settings.ilHeaderBottomMargin = "" + $('#ilHeaderBottomMargin').bootstrapSlider('getValue')
    settings.ilShow = $('#ilShow').hasClass('active')
    settings.ilSep = $('#ilSep').hasClass('active')

    // Game Divider Settings
    // TODO new settings here
    settings.gameDivHeight = "" + $('#gameDividerHeight').bootstrapSlider('getValue')
    settings.gameDivColor = $('#gameDividerColor').val()
    settings.gameDivBottomMargin = "" + $('#gameDividerBottomMargin').bootstrapSlider('getValue')

    // Panel Background Settings
    settings.panelBackgroundColor = $('#panelBackgroundColor').val()

    // Scrollbar Settings
    // TODO new settings
    settings.scrollbarWidth = "" + $('#scrollbarWidth').bootstrapSlider('getValue')
    settings.scrollbarOpacity = "" + $('#scrollbarOpacity').bootstrapSlider('getValue')
    settings.scrollbarColor = $('#scrollbarColor').val()

    // Finished
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
