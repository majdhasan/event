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

const apiRouter = express.Router();

apiRouter.route('/login').post((req, res) => {
  let user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, (err, scc) => {
        err
          ? console.log(err)
          : res.send({
              username: req.user.username,
              firstname: req.user.firstname,
              lastname: req.user.lastname,
              id: req.user._id,
            });
      });
    }
  });
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
        passport.authenticate('local')(req, res, () => {
          res.status(200).send(req.user);
        });
      }
    }
  );
});

apiRouter.route('/loggedUser').get((req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(400).send('You are not logged in');
  }
});

module.exports = apiRouter;
