/// Config Page for Frontend

$( "#sortableGames" ).sortable();
$( "#sortableGames" ).disableSelection();

var authObject;
var srcID;

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    console.log('The JWT that will be passed to the EBS is', authObject.token);
    console.log('The channel ID is', authObject.channelId);
});

function enableSaveButton() {
    console.log("soon")
}

function printResults(json) {
    var data = json.data

    // No name found
    if (data.length <= 0) {
        console.log("Nothing found with that name")
        return;
    }
    // More than 1 result, not going to handle this, so be more specific please
    else if (data.length > 1) {
        console.log("Found too many results, be more specific")
        return;
    }

    // K we are fine then, get the ID
    srcID = data[0].id;
    // Populate the game list
    getGameList();
    // Check to see if we should update the save button
    enableSaveButton();
}

var gameList = []

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
        $.getJSON("https://www.speedrun.com/api/v1/games/" + game.id + "?callback=?", function(json) {
            game = json.data
            index = gameList.findIndex(x => x.id === game.id)
            gameList[index].name = game.names.international
            $( "#sortableGames" ).append(
                '<li class=ui-state-default><input type=checkbox value=' + game.id + ' checked>' + gameList[index].name + '</input></li>'
            )
        })
    }
}

function getGameList() {

    $.ajax({
        url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
        dataType: "jsonp",
        jsonpCallback: "populateGameList"
    });
}

$("#searchBtn").click(function(){
    // Spinner? http://jsfiddle.net/q1d06npq/4/
    $.ajax({
        url: "https://www.speedrun.com/api/v1/users?lookup=" + $("#srcName").val(),
        dataType: "jsonp",
        jsonpCallback: "printResults"
    });
})


$("#saveBtn").click(function(){
    $.ajax({
        type: "POST",
        url: "https://e2fd96a3.ngrok.io/save", // TODO i hate this
        headers: {
          'x-extension-jwt': authObject.token,
        },
        dataType: "json",
        data: {
            theme: $('#panelTheme').val(),
            title: $('#panelTitle').val(),
            srcID: $('#srcName').val()
            // TODO not passing in game ids yet!
        },
        success: function (res) {
           console.log('Success\nResponse Code:' + res.status + '\nMessage: ' + res.message);

        },
        error: function () {
            alert('Error');
        }
    });
});
