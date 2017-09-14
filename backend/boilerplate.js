"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
ORIGINAL HAS BEEN MODIFIED
*/
require('dotenv').config()
const express = require('express');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const Datastore = require('@google-cloud/datastore');
const twitch = require('./twitchlib')
const lib = require('./lib')

/// Simple object to represent channel object in database
class Channel {
    constructor(key, theme, title, srcID, games) {
        this.key = key
        this.data = [
            {name:'theme',value:theme},
            {name:'title',value:title},
            {name:'srcID',value:srcID},
            {name:'games',value:games}]
    }
}

// Instantiates a client
const datastore = Datastore();
const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/save', function (req, res) {
    var response = {
        status  : 200,
        message : 'Saved Successfully'
    }

    var token = twitch.verifyToken(req.header('x-extension-jwt'))
    // If not the broadcaster, cant do any of this
    // or if any errors happened during verifying token
    if (token == null || token.role != "broadcaster") {
        response.status = 500
        response.message = "Not the Broadcaster, can't edit!"
        res.send(JSON.stringify(response))
        return;
    }
    // Else, save or update the database entry
    var data = req.body
    // Channel kind, combined with channelid, every channel is isolated
    const taskKey = datastore.key([
      'Channel',
      token.channel_id
    ]);
    // Actual data
    console.log(data)
    console.log(data.games)
    const chan = new Channel(taskKey, data.theme, data.title, data.srcID, data.games)
    datastore.upsert(chan)
        .then(() => {})
        .catch((err) => {
          response.status = 501
          response.message = "Database Saving Unsuccessful"
        });
    res.send(JSON.stringify(response));
});

app.post('/fetch', function (req, res) {
    var response = {
        status  : 200,
        message : 'Retrieved Data Successfully',
        data : null
    }

    var token = twitch.verifyToken(req.header('x-extension-jwt'))
    // if any errors happened during verifying token
    if (token == null) {
        response.status = 500
        response.message = "Not a valid Twitch User"
        res.send(JSON.stringify(response))
        return;
    }
    // Else fetch the value from the datastore and return it
    // Channel kind, combined with channelid, every channel is isolated
    const taskKey = datastore.key([
      'Channel',
      token.channel_id
    ]);
    datastore.get(taskKey)
      .then((results) => {
        // Task found.
        const entity = results[0];
        console.log(entity);
        response.data = entity;
        res.send(JSON.stringify(response))
      });
});

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static('../frontend'))

http.createServer(app).listen(PORT, function () {
    console.log('Extension Boilerplate service running on http', PORT);
});
