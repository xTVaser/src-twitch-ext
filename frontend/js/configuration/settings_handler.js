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
    settings.panelTitleFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
    settings.categoryHeaderFontFamily = settings.pbHeaderFontFamily = settings.wrHeaderFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
  if (settings.hasOwnProperty('panelTitleDivHeight')) {
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
    settings.gameTitleFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
    settings.gameCategoryFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
    settings.pbFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
    settings.miscHeaderFontFamily = settings.ilHeaderFontFamily = dropSecond.substring(1, dropSecond.length - 1)
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
  if (settings.hasOwnProperty('gameDivHeight')) {
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