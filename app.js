// Require Packages
const express = require('express');
require('dotenv').config();
const dbConnection = require('./db/connect');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const router = require('./routes/routes');
const apiRouter = require('./routes/api-routes');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const _ = require('lodash');
const cors = require('cors');
const mongoose = require('mongoose');
const Conversation = require('./model/Conversation');

// Initialized Express App
const app = express();

// Initilize HTTP Server for the socket io chat
var http = require('http').createServer(app);
var io = require('socket.io')(http);

io.on('connection', (socket) => {
  socket.on('loadMessages', (conversationId) => {
    Conversation.findById(conversationId, (err, conversation) => {
      if (err) throw err;
      socket.emit('initialMessages', conversation.messages);
    });
  });

  socket.on('add', (msg) => {
    console.log(msg);
    io.emit('message', msg);
    Conversation.findById(msg.conversation, (err, conv) => {
      conv.messages.push(msg);
      conv.save((err) => {
        if (err) throw err;
      });
    });
  });

  socket.on('disconnect', () => {});
});

app.use(cors());

// Parse incoming messages

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

// Router the requests of the API
app.use('/api/v1', apiRouter);

// Route the requests to the local views (EJS)
app.use(router);

// Handle incoming request

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Listen on the port (default 4000)
http.listen(port, () => {
  console.log('App started on port ' + port);
});
