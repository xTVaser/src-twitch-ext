function addFontFamily(setting) {
    if (setting == null) {
        return "Roboto Condensed"
    }
    return `${setting}, Roboto Condensed`
}

// Testing Scaffolding
if (typeof exports !== 'undefined') {
    exports.addFontFamily = addFontFamily
}

// Setup Streamer's Styling
function configureCustomStyling() {
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

    // Panel Background Settings
    $("body").css("background-color", `${settings.panelBackgroundColor}`)

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

