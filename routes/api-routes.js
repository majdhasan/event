const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { render } = require('ejs');
const passport = require('passport');
const Event = require('../model/Event');
const User = require('../model/User');
const Founder = require('../model/Founder');
const Invite = require('../model/Invite');
const { findByIdAndUpdate } = require('../model/Event');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
var jwt = require('jsonwebtoken');

const apiRouter = express.Router();

// ------------------------------------ Utilities ----------------------------------------

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const [bearer, token] = bearerHeader.split(' ');
    console.log('a request with following token has just arrived' + token);
    jwt.verify(token, process.env.PRIVATEKEY, (err, decoded) => {
      if (err) {
        res.sendStatus(403);
      } else {
        req.token = token;
        req.user = decoded.user;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};

// ------------------------------------ Routes ----------------------------------------

// ------------------------------------ Authentication/Authorization ----------------------------------------

apiRouter.route('/login').post((req, res) => {
  if (req.body.username && req.body.password) {
    let user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, () => {
          jwt.sign({ user: req.user }, process.env.PRIVATEKEY, (err, token) => {
            if (err) console.log(err);
            if (token) {
              res.status(200).json({ token: token, user: req.user });
            }
          });
        });
      }
    });
  } else {
    res.sendStatus(404);
  }
});

apiRouter.route('/signup').post((req, res) => {
  console.log(req.body);
  User.register(
    {
      username: req.body.username,
      firstname: req.body.fname,
      lastname: req.body.lname,
      pendingInvites: 0,
      conversations: [],
    },
    req.body.password,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log('new user has been created' + result);
        jwt.sign({ user: result }, process.env.PRIVATEKEY, (err, token) => {
          if (err) console.log(err);
          if (token) {
            console.log(token);
            res.json({ token });
          }
        });
      }
    }
  );
});

// ------------------------------------ Restricted Routes ----------------------------------------

apiRouter.route('/test').get(verifyToken, (req, res) => {
  console.log('a new request arrived from' + req.user._id);
  res.json({ user: req.user });
});

// ------------------------------------ END OF API ----------------------------------------
module.exports = apiRouter;
