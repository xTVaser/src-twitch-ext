"use strict";

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const striptags = require("striptags");
const jwt = require('jsonwebtoken');

// Instantiates a client
const datastore = {};
const app = express();
const PORT = 8081;

/// Messages that everyone will see to inform them on a problem
const configMessage = "";
const panelMessage = "";

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

class Channel {
    constructor(key, settings, srcID, srcName, games) {
        // Sanitize Data
        var settingsObj = JSON.parse(settings);
        for (var k in settingsObj) {
            if (settingsObj.hasOwnProperty(k)) {
                if (settingsObj[k] != true && settingsObj[k] != false) {
                    settingsObj[k] = striptags(settingsObj[k]);
                }
            }
        }
        srcID = striptags(srcID);
        srcName = striptags(srcName);
        // Allow br tags, thats it
        var gamesObj = JSON.parse(games);
        for (var i = 0; i < gamesObj.length; i++) {
            for (var k in gamesObj[i]) {
                // TODO duplication, could refactor this into one OR
                if (k == "name" && gamesObj[i].hasOwnProperty(k)) {
                    gamesObj[i][k] = striptags(gamesObj[i][k], "<br>");
                } else if (k == "categories" && gamesObj[i].hasOwnProperty(k)) {
                    for (var index = 0; index < gamesObj[i][k].length; index++) {
                        gamesObj[i][k][index] = striptags(gamesObj[i][k][index]);
                    }
                } else if (k == "levels" && gamesObj[i].hasOwnProperty(k)) {
                    for (var index = 0; index < gamesObj[i][k].length; index++) {
                        gamesObj[i][k][index] = striptags(gamesObj[i][k][index]);
                    }
                } else if (k == "categoryNames" && gamesObj[i].hasOwnProperty(k)) {
                    for (var index = 0; index < gamesObj[i][k].length; index++) {
                        gamesObj[i][k][index] = striptags(gamesObj[i][k][index]);
                    }
                } else if (k == "miscCategoryNames" && gamesObj[i].hasOwnProperty(k)) {
                    for (var index = 0; index < gamesObj[i][k].length; index++) {
                        gamesObj[i][k][index] = striptags(gamesObj[i][k][index]);
                    }
                } else if (k == "levelNames" && gamesObj[i].hasOwnProperty(k)) {
                    for (var index = 0; index < gamesObj[i][k].length; index++) {
                        gamesObj[i][k][index] = striptags(gamesObj[i][k][index]);
                    }
                } else if (gamesObj[i].hasOwnProperty(k)) {
                    if ((gamesObj[i][k] != true) & (gamesObj[i][k] != false)) {
                        gamesObj[i][k] = striptags(gamesObj[i][k]);
                    }
                }
            }
        }
        this.key = key;
        this.data = [
            {
                name: "settings",
                value: JSON.stringify(settingsObj),
                excludeFromIndexes: true
            },
            {
                name: "srcID",
                value: srcID
            },
            {
                name: "srcName",
                value: srcName
            },
            {
                name: "games",
                value: JSON.stringify(gamesObj),
                excludeFromIndexes: true
            }
        ];
    }
}

app.options("/save", function (req, res) {
    var params = {
        ec: "Configuration",
        ea: "Pre-flight Handshake",
        el: "Pre-flight",
        geoid: req.get("CF-IPCountry")
    }
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-extension-jwt"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Origin", "*");
    var response = {
        status: 200
    };
    res.send(response);
});

app.post("/save", function (req, res) {
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
        "x-extension-jwt"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Origin", "*");
    var response = {
        status: 200,
        message: "Saved Successfully"
    };

    // Save or update the database entry
    var data = req.body;
    // JWT Decode this, but don't care about validity (in terms of twitch)
    var token = jwt.verify(req.header("x-extension-jwt"), "password123");
    const chan = new Channel(
        token.channel_id,
        data.settings,
        data.srcID,
        data.srcName,
        data.games
    );

    console.log(`Saving ${token.channel_id}'s data`);
    datastore[token.channel_id] = chan;
    res.send(response);
});

app.options("/fetch", function (req, res) {
    var params = {
        ec: "Panel",
        ea: "Pre-flight Handshake",
        el: "Pre-flight",
        geoid: req.get("CF-IPCountry")
    }
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-extension-jwt"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Origin", "*");
    var response = {
        status: 200
    };
    res.send(response);
});

app.post("/fetch", function (req, res) {
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, x-extension-jwt"
    );
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    res.setHeader("Access-Control-Allow-Origin", "*");
    var response = {
        status: 200,
        message: "Retrieved Data Successfully",
        data: null
    };

    // TODO - add back the other response options
    var token = jwt.verify(req.header("x-extension-jwt"), "password123");
    const rawEntity = datastore[token.channel_id];
    console.log(rawEntity);
    var entity = {};
    for (var i = 0; i < rawEntity.data.length; i++) {
        entity[rawEntity.data[i]['name']] = rawEntity.data[i]['value'];
    }
    response.data = entity;
    response.configMessage = configMessage;
    response.panelMessage = panelMessage;
    console.log(`Retrieved ${token.channel_id}'s data.`)
    res.send(response);
});

app.use((req, res, next) => {
    // try to remove these after
    var params = {
        ec: "Accessed Non-Extension Page",
        ea: req.path,
        el: req.get("CF-Connecting-IP"),
        geoid: req.get("CF-IPCountry")
    }
    //res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With', 'x-extension-jwt');
    res.setHeader("Access-Control-Allow-Methods", "GET");
    //res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
});

http.createServer(app).listen(PORT, function () {
    console.log("Extension Boilerplate service running on https", PORT);
});
