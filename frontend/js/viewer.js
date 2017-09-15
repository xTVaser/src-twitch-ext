/// Javascript to render the personal bests on the channel page

var games
var title
var theme
var srcID

var pbList = new Array()

window.Twitch.ext.onAuthorized(function(auth) {

    console.log('The JWT that will be passed to the EBS is', auth.token);
    console.log('The channel ID is', auth.channelId);

    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/fetch",
        headers: {
          'x-extension-jwt': auth.token,
        },
        dataType: "json",
        data: {},
        success: function (res) {
           console.log('Success\nResponse Code:' + res.status + '\nMessage: ' + res.message);
           games = JSON.parse(res.data.games)
           title = res.data.title
           theme = res.data.theme
           srcID = res.data.srcID
           // First we will get all the runner's personal bests
           $.ajax({
               url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
               dataType: "jsonp",
               jsonpCallback: "getPersonalBests"
           });
        },
        error: function () {
            alert('Error');
        }
    });
});

var asyncLoop = function(o){
    var iter = -1
    var length = o.length

    var loop = function(){
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
                    variables: run.values, // We have no guarantee which variables are subcategories or not until we check
                    pbTime: run.times.primary_t,
                    pbLink: run.weblink,
                    wrLink: null,
                    wrTime: null,
                    rank: personalBests[iter].place
                })
            }
            loop()
        },
        callback: function() {
            // We will get the category link first then
            console.log("finished")
            console.log(pbList)
            getCategories()
        }
    })

    // And finally, the world records for each category using the variable
}

function getCategoryName(url, currentPBEntry) {
    $.getJSON(url + "?callback=?", function(json) {
        category = json.data
        currentPBEntry.categoryName = category.name
        currentPBEntry.categoryLink = category.weblink
    })
}

function getCategories() {
    gameIDs = Object.keys(pbList)
    categoryAPILink = "https://www.speedrun.com/api/v1/categories/"
    var ajaxRequests = []
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            getCategoryName(categoryAPILink + currentPBEntry.categoryID, currentPBEntry)
        }
    }
    // Then the variable link to fully construct the category link
    getSubcategories()
}

function examineVariables(url, currentPBEntry) {

    $.getJSON(url + "?callback=?", function(json) {
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
    })
}

function getSubcategories() {
    gameIDs = Object.keys(pbList)
    variableAPILink = "https://www.speedrun.com/api/v1/categories/"
    var ajaxRequests = []
    for (var i = 0; i < gameIDs.length; i++) {
        for (var j = 0; j < pbList[gameIDs[i]].length; j++) {
            currentPBEntry = pbList[gameIDs[i]][j]
            examineVariables(variableAPILink + currentPBEntry.categoryID + "/variables", currentPBEntry)
        }
    }
    // Finally, get the WRs
}

/// Collapse or Expand Game's Row
$('.gameTitle').click(function(e) {
    id = e.currentTarget.id.substring(1)
    $('#pbRow' + id).slideToggle('fast');
})

/// Renders the Panel with the given settings
function renderPersonalBests(data) {

    // If we find nothing, output some default stuff
}

/// Unused atm, because twitch's handler is what we actually need
$(document).ready(function() {



})
