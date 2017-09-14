/// Javascript to render the personal bests on the channel page


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
           renderPersonalBests(res.data)
        },
        error: function () {
            alert('Error');
        }
    });
});

$('#game1').click(function() {
    $('#pbList1').slideToggle('fast');
})

/// Renders the Panel with the given settings
function renderPersonalBests(data) {

    console.log(data)















}

/// Unused atm, because twitch's handler is what we actually need
$(document).ready(function() {



})
