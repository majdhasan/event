// Require Packages
const express = require('express');
require('dotenv').config();
const dbConnection = require('./db/connect');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const router = require('./routes/routes');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');


// Initialized Express App
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

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

app.use(router);

// Handle incoming request

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.listen(port, () => {
  console.log('App started on port ' + port);
});
