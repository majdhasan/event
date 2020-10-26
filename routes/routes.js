const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { render } = require('ejs');
const passport = require('passport');
const Event = require('../model/Event');
const User = require('../model/User');

const router = express.Router();

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.use((req, res, next) => {
  console.log(`${new Date()}: Incoming request from ${req.headers.host} `);
  next();
});

router.route('/user').get((req, res) => {
  if (req.isAuthenticated()) {
    Event.find((err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.render('home', { events: results });
      }
    });
  } else {
    res.redirect('/login');
  }
});

router
  .route('/event')
  .get((req, res) => {})
  .post((req, res) => {
    let newEvent = new Event({
      title: req.body.title,
      body: req.body.description,
      //   creator: req.body.userId,
      date: new Date(),
      comments: [],
      guests: [],
    });
    newEvent.save((err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log('New Event has been created');
        res.redirect('/user');
      }
    });
  });

router.route('/event/new').get((req, res) => {
  res.render('newEvent');
});

router
  .route('/event/:id')
  .get((req, res) => {})
  .post((req, res) => {});


router
  .route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    let user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, (err, scc) => {
          err ? console.log(err) : res.redirect('/user');
        });
      }
    });
  });

router
  .route('/signup')
  .get((req, res) => {
    res.render('signup');
  })
  .post((req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, result) => {
        if (err) {
          console.log(err);
          res.redirect('signup');
        } else {
          passport.authenticate('local')(req, res, () => {
            res.redirect('/user');
          });
        }
      }
    );
  });

module.exports = router;
