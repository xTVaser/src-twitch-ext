/// Javascript to render the personal bests on the channel page

var games
var title
var theme
var srcID

var pbList = []

window.Twitch.ext.onAuthorized(function(auth) {

    console.log('The JWT that will be passed to the EBS is', auth.token);
    console.log('The channel ID is', auth.channelId);

    $.ajax({
        type: "POST",
        url: "https://3b2821fc.ngrok.io/fetch",
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

function getPersonalBests(json) {

    personalBests = json.data
    for (let pb in personalBests) {
        // NOTE can get rank pb.place
        run = pb.run
        // If this is one of the games that should be tracked
        index = games.findIndex(x => x.id === run.game)
        if (index > -1) {
            pbList[run.game].push([
                "category name" + run.category,
                "pb - " + run.times.primary_t,
                run.weblink,
                run.variables // subcategories....
            ]) // TODO change to dictionary later
        }
    }

    // Now with all the PBs, we still need category names, and WR times


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
