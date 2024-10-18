const functions = require("firebase-functions");
const express = require('express');
const logger = require("firebase-functions/logger");
const { databaseURL } = require("firebase-functions/params");
const route_users= require('./api_routes/users');



const app = express();
app.use('/users', route_users);

exports.app = functions.https.onRequest(app);