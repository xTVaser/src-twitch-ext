"use strict";

/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express');
const fs = require('fs');
const http = require('http');

const app = express();

app.use((req, res, next) => {
  console.log('Got request', req.path, req.method);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return next();
});

app.use(express.static('../frontend'))

let options = {
   key  : fs.readFileSync('/boilerplate/certs/server.key'),
   cert : fs.readFileSync('/boilerplate/certs/server.crt')
};

const PORT = 8080;
http.createServer(app).listen(PORT, function () {
  console.log('Extension Boilerplate service running on https', PORT);
});

console.log("test");
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const datastore = Datastore({
  projectId: projectId
});

// The kind for the new entity
const kind = 'channel';
// The name/ID for the new entity
const id = 'abc123';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind, name]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
    css-theme: 0,
	game-ids: {
		values: [
			"stringValue": 'test'
		]
	}
  }
};

// Saves the entity
datastore.save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}: ${task.data.description}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });

