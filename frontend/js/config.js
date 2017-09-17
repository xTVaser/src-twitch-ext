/// Config Page for Frontend

$( "#sortableGames" ).sortable();
$( "#sortableGames" ).disableSelection();

var authObject = null;
var srcID = null;
var canSave = false;

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    // console.log('The JWT that will be passed to the EBS is', authObject.token);
    // console.log('The channel ID is', authObject.channelId);

    // Check for existing data and add it to the panels
});

function setError(string) {
    $("#errorDialog").html(
        `<h3>${string}</h3>`
    )
}

function getPersonalBest(url) {
    ajaxCalls.push($.getJSON(url, function(json) {
        game = json.data
        index = gameList.findIndex(x => x.id === game.id)
        gameList[index].name = game.names.international
        $( "#sortableGames" ).append(
            `<li class=ui-state-default>
                <input type=checkbox value="${game.id}" checked>${gameList[index].name}</input>
            </li>`
        )
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
        getPersonalBest(`https://www.speedrun.com/api/v1/games/${game.id}?callback=?`)
    }

    $.when.apply(null, ajaxCalls).done(function() {
        ajaxCalls = []
        // Disable the spinner
        $('.spinnerWrapper').remove();
        $('#saveBtn').prop("disabled", false)
        $("#saveBtn").attr('class', 'btn-warning');
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
    })
}

function getGameList() {
    $.ajax({
        url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
        dataType: "jsonp",
        jsonpCallback: "populateGameList"
    });
}

function printResults(json) {
    var data = json.data

    // No name found
    if (data.length <= 0) {
        setError("No one found on Speedrun.com by that name!")
        return;
    }
    // More than 1 result, not going to handle this, so be more specific please
    else if (data.length > 1) {
        setError("Found too many users by that name, be more specific!")
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
        dataType: "jsonp",
        jsonpCallback: "printResults"
    });
}

$("#searchBtn").click(function(){
    // Clean Potential Previous State
    $("#sortableGames").html('')
    srcID = null;
    gameList = []

    // Disable the search button temporarily
    $("#searchBtn").prop("disabled",true);
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
        `<h3>Game List (Reorderable and Toggleable)</h3><br>`
    )
    searchForUser($("#srcName").val())
})


$("#saveBtn").click(function(){

    // Check to see if we can actually save or not
    if (gameList == []) {
        setError("ERROR: There are no Games Selected!")
        return;
    }
    if (srcID == null) {
        setError("ERROR: No Speedrun.com Name Choosen")
        return;
    }
    if ($('#panelTitle').val() == "") {
        setError("ERROR: No title given to panel!")
        return;
    }
    $("#errorDialog").html('')

    gamesToSend = []
    $('#sortableGames', function(){
        $(this).find('li').each(function(){
            game = {}
            var currentListItem = $(this)
            var checkbox = currentListItem.find('input')
            if (checkbox.is(':checked')) {
                // Then we will add the game
                gamesToSend.push({
                    name: currentListItem.text(),
                    id: checkbox.val()
                })
            }
        })
        // Re have all results
        sendResult(gamesToSend)
    });

});

function sendResult(gamesToSend) {
    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/save",
        headers: {
          'x-extension-jwt': authObject.token,
        },
        dataType: "json",
        data: {
            theme: $('#panelTheme').val(),
            title: $('#panelTitle').val(),
            srcID: srcID,
            games: JSON.stringify(gamesToSend)
        },
        success: function (res) {
            if (res.status == 501) {
                setError("Saving Error: Database Error, Contact Extension Developer")
            }
            else {
                setError("SUCCESS: Saved Successfully!")
            }
        },
        error: function () {
            setError("ERROR: An Unexpected Error Occurred, Contact Extension Developer")
        }
    });
}
