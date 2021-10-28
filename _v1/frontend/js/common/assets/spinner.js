for (var i = 1; i <= 8; i++) {
    var random_color = '#'+Math.floor(Math.random()*16777215).toString(16);
    $(`div.spinner i:nth-child(${i})`).css('border-color', random_color);
}

