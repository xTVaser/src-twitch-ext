"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
require('dotenv').config()
const jwt = require('jsonwebtoken');
const express = require('express');
const fs = require('fs');
const http = require('http');
const bodyParser = require('body-parser');
const Datastore = require('@google-cloud/datastore');

// Instantiates a client
const datastore = Datastore();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/save', function (req, res) {
    var token = verifyToken(req.header('x-extension-jwt'))
    console.log(token)
    var object = JSON.parse(req.body.o);
    console.log(object);
    console.log(object.string1);
    console.log(object.string2);
    var response = {
        status  : 200,
        success : 'Updated Successfully'
    }
    res.send(JSON.stringify(response));
});

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static('../frontend'))

const PORT = 8080;
http.createServer(app).listen(PORT, function () {
    console.log('Extension Boilerplate service running on http', PORT);
    const taskKey = datastore.key([
      'Channel',
      '1234567890'
    ]);
    const entity = {
        key: taskKey,
        data: [
          {
            name: 'theme',
            value: "darkly"
          },
          {
            name: 'games',
            value: [
                "abc1234",
                "dfg456"
            ]
          }
        ]
    };

    datastore.upsert(entity)
        .then(() => {
          console.log(`Task ${taskKey.id} created successfully.`);
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
    console.log(process.env.CLOUD_ID);

    console.log("hello")
    console.log(signToken())

});

function verifyToken(token) {
    console.log(token)
    try {
        var decoded = jwt.verify(token, new Buffer(process.env.TWITCH_SECRET, 'base64'));
        return decoded
    } catch(err) {
        console.log(err);
    }
}

function signToken() {

    var initToken = {
        "exp": (new Date).getTime() + (60*10), // 10minute positive buffer
        "user_id": process.env.TWITCH_EXT_ID,
        "role": "external"
    }

    var token = jwt.sign(initToken, process.env.TWITCH_SECRET);

    return "Bearer " + token;
}

function twitchAPI() {
    // Would be nice to have this, but currently dont need anything from twitch API
    // var options = {
    //   host: 'https://api.twitch.tv',
    //   port: 80,
    //   path: "/extensions/" + process.env.TWITCH_CLIENT_ID + "/auth/secret",
    //   method: 'POST',
    //   headers: {
    //       'Authorization': signToken(),
    //       'Client-Id': process.env.TWITCH_CLIENT_ID
    //   }
    // };
    // http.get(options, function(res){
    //     res.setEncoding('utf8');
    //     res.on('data', function(chunk){
    //         console.log(chunk);
    //     });
    //     }).on("error", function(e){
    //     console.log("Got error: " + e.message);
    // });
}
