//Function handler to get a JSON data with no external libraries.
var fetchJSON = function(url, func) {

    //Setup the request, its a GET request, and we are expecting json
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "json";
    //Once the request returns, check if its valid, if it is return the function with no arrays.
    request.onload = function() {
        var flag = request.status;
        if (flag == 200) // HTTP200 = OK
            func(null, request.response);
        else
            func(flag);
    };
    //Send the request, it is asychronous so it the fact that this is at the end, doesnt matter.
    request.send();
}
