// Fixes bootstrap dropdowns so they dont close on clicks within the dropdown
$(document).on('click', 'div .dropdown-menu', function (e) {
    e.stopPropagation();
});