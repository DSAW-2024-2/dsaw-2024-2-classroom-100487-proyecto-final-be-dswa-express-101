//database functions
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const { databaseURL } = require("firebase-functions/params");


const express = require('express');
const cors = require('cors');
const {authenticate} = require('./middlewares/authenticate');
const route_register= require('./api_routes/registrer');
const route_login= require('./api_routes/login');
const route_user= require('./api_routes/user');
const app = express();
app.use(cors());

app.use(express.json());
app.get('/', (req, res) => {
    res.send('welcome to Api campus rush');
});

app.use('/register',route_register);
app.use('/login',route_login);
app.use('/user', authenticate, route_user);



module.exports = app;