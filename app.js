// Require Packages
const express = require('express');
require('dotenv').config();
const dbConnection = require('./db/connect');
const bodyParser = require('body-parser');
const router = require('./routes/routes');
const apiRouter = require('./routes/api-routes');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');
const cors = require('cors');

// Initialized Express App
const app = module.exports =  express();

// Initialize cors
app.use(cors());

// Require Socket.io
require('./db/socketIoConfig');

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

// Initilaize Passport sessions

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect to DB
dbConnection;

// Route the requests of the API
app.use('/api/v1', apiRouter);

// Route the requests to the local views (EJS)
app.use(router);

// Handle incoming request

app.set('view engine', 'ejs');
app.use(express.static('public'));
