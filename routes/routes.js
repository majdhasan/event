const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { render } = require('ejs');
const passport = require('passport');
const Event = require('../model/Event');
const User = require('../model/User');
const Founder = require('../model/Founder');

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

//Founders
router.route('/founder').get((req, res) => {
  Founder.findById(req.query.id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(404);
      res.redirect('/404');
    } else {
      res.render('founder', { founder: result });
    }
  });
}).post((req,res)=>{
  let founder = new Founder({
    name : req.body.name,
    description : req.body.description,
    avatar : req.body.avatar,
    map: req.body.map
  });
  founder.save((err, scc)=>{
    if (err) {
      console.log(err);
    }else{
      res.send("Successfully added founder")
    }
  })
})

router.route('/home').get((req, res) => {
  if (req.isAuthenticated()) {
    Event.find({ creator: req.user._id }, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(req.user._id);
        res.render('home', { user: req.user, events: results });
      }
    });
  } else {
    res.redirect('/login');
  }
});

router
  .route('/event')
  .get((req, res) => {
    Event.findById(req.query.id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.render('event', { event: result });
      }
    });
  })
  .post((req, res) => {
    if (req.isAuthenticated()) {
      let newEvent = new Event({
        title: req.body.title,
        body: req.body.description,
        type: req.body.eventType,
        creator: req.user._id,
        date: new Date(),
        comments: [],
        guests: [],
      });
      newEvent.save((err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log('New Event has been created');
          res.redirect('/home');
        }
      });
    } else {
      res.redirect('/login');
    }
  });

router.route('/event/new').get((req, res) => {
  if (req.isAuthenticated()) {
    res.render('newEvent');
  } else {
    res.redirect('/login');
  }
});

router
  .route('/event/:id')
  .get()
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
          err ? console.log(err) : res.redirect('/home');
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
      {
        username: req.body.username,
        firstname: req.body.fname,
        lastname: req.body.lname,
      },
      req.body.password,
      (err, result) => {
        if (err) {
          console.log(err);
          res.redirect('signup');
        } else {
          passport.authenticate('local')(req, res, () => {
            res.redirect('/home');
          });
        }
      }
    );
  });

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/home');
});

module.exports = router;
