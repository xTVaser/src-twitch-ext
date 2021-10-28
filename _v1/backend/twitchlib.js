/// In this file are functions related directly with interacting with
/// twitch's APIs

// Required Libs
const lib = require('./lib');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const http = require('http');

exports.signToken = function signToken() {

    var initToken = {
        "exp": (new Date).getTime() + (60*10), // 10minute positive buffer
        "user_id": process.env.TWITCH_EXT_ID,
        "role": "external"
    }

    var token = jwt.sign(initToken, process.env.TWITCH_SECRET);

    return "Bearer " + token;
}

exports.verifyToken = function verifyToken(token) {
    try {
        var decoded = jwt.verify(token,
            new Buffer(process.env.TWITCH_SECRET, 'base64'));
        return decoded
    } catch(err) {
        console.log(err);
        return null
    }
}
