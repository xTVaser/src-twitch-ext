"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
ORIGINAL HAS BEEN MODIFIED
*/
require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");
const Datastore = require("@google-cloud/datastore");
const twitch = require("./twitchlib");
const lib = require("./lib");
const ua = require('universal-analytics')
var morgan = require("morgan");
var striptags = require("striptags");
var visitor = ua(process.env.ANALYTICS_ID);

/// Simple object to represent channel object in database
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

// Instantiates a client
const datastore = Datastore();
const app = express();
const PORT = 443;

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream("./logs.log", {
  flags: "a"
});

// setup the logger
app.use(
  morgan("combined", {
    stream: accessLogStream
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.options("/save", function(req, res) {
  console.log("Settings being Saved - Handshake");
  visitor.pageview(req.path + "/options").send();
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

app.post("/save", function(req, res) {
  console.log("Settings being Saved - Actually saving");
  visitor.pageview(req.path).send();
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

  var token = twitch.verifyToken(req.header("x-extension-jwt"));
  // If not the broadcaster, cant do any of this
  // or if any errors happened during verifying token
  if (token == null || token.role != "broadcaster") {
    response.status = 500;
    response.message = "Not the Broadcaster, can't edit!";
    res.send(JSON.stringify(response));
    return;
  }
  // Else, save or update the database entry
  var data = req.body;
  // Channel kind, combined with channelid, every channel is isolated
  const taskKey = datastore.key(["Channel", token.channel_id]);
  // Actual data
  //console.log(data)
  //console.log(data.games)
  const chan = new Channel(
    taskKey,
    data.settings,
    data.srcID,
    data.srcName,
    data.games
  );
  datastore
    .upsert(chan)
    .then(() => {
      res.send(JSON.stringify(response));
      console.log(response);
    })
    .catch(err => {
      response.status = 501;
      response.message = "Database Saving Unsuccessful";
      res.send(JSON.stringify(response));
      console.log(err);
    });
});

app.options("/fetch", function(req, res) {
  console.log("Fetching Info - Handshake");
  visitor.pageview(req.path + "/options").send();
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

app.post("/fetch", function(req, res) {
  console.log("Fetching Info - Channel being freshed.");
  visitor.pageview(req.path).send();
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

  var token = twitch.verifyToken(req.header("x-extension-jwt"));
  // if any errors happened during verifying token
  if (token == null) {
    response.status = 500;
    response.message = "Not a valid Twitch User";
    res.send(JSON.stringify(response));
    return;
  }
  // Else fetch the value from the datastore and return it
  // Channel kind, combined with channelid, every channel is isolated
  const taskKey = datastore.key(["Channel", token.channel_id]);
  datastore
    .get(taskKey)
    .then(results => {
      // Task found.
      const entity = results[0];
      response.data = entity;
      res.send(JSON.stringify(response));
    })
    .catch(err => {
      response.status = 501;
      response.message = "Nothing to Retrieve";
      res.send(JSON.stringify(response));
    });
});

app.use((req, res, next) => {
  // try to remove these after
  console.log("Got generic request", req.path, req.method);
  visitor.pageview(req.path).send();
  //res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With', 'x-extension-jwt');
  res.setHeader("Access-Control-Allow-Methods", "GET");
  //res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static("../frontend"));

let options = {
  cert: fs.readFileSync("../certs/server.crt"),
  key: fs.readFileSync("../certs/server.key")
};

https.createServer(options, app).listen(PORT, function() {
  console.log("Extension Boilerplate service running on https", PORT);
});
