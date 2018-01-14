// Fixes bootstrap dropdowns so they dont close on clicks within the dropdown
$(document).on('click', 'div .dropdown-menu', function (e) {
    e.stopPropagation();
});

// TODO get rid of this, just for testing purpsoes
setInterval(getTheValue, 500);
function getTheValue() {

    var element = $('#panelTitleFontBold')
    console.log(element.hasClass('active'))
}