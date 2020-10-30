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

const router = express.Router();

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// router.use((req, res, next) => {
//   console.log(`${new Date()}: Incoming request from ${req.headers.host} `);
//   next();
// });

//Founders
router
  .route('/founder')
  .get((req, res) => {
    Founder.findById(req.query.id, (err, result) => {
      if (err) {
        console.log(err);
        res.status(404);
        res.redirect('/404');
      } else {
        res.render('founder', { founder: result });
      }
    });
  })
  .post((req, res) => {
    let founder = new Founder({
      name: req.body.name,
      description: req.body.description,
      avatar: req.body.avatar,
      map: req.body.map,
    });
    founder.save((err, scc) => {
      if (err) {
        console.log(err);
      } else {
        res.send('Successfully added founder');
      }
    });
  });

router.route('/home').get((req, res) => {
  if (req.isAuthenticated()) {
    Event.find({ creator: req.user._id }, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(req.user._id);
        res.render('newView/home', { user: req.user, events: results });
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
        if (result.type === 'public') {
          res.render('newView/event', { event: result });
        } else {
          if (
            req.isAuthenticated() &&
            result.canAccess.includes(req.user._id)
          ) {
            res.render('event', { event: result });
          } else {
            res.status(403).send('You have no access');
          }
        }
      }
    });
  })

  .post((req, res) => {
    if (req.isAuthenticated()) {
      let newEvent = new Event({
        title: req.body.title,
        body: req.body.description,
        type: req.body.eventType,
        street: req.body.street,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        creator: req.user._id,
        date: req.body.date,
        lookingFor: req.body.lookingFor,
        comments: [],
        canAccess: [],
        invites: [],
      });
      newEvent.canAccess.push(req.user._id);
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
    res.render('newView/newEvent');
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
    req.isAuthenticated() ? res.redirect('/home') : res.render('newView/login');
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

router.route('/comment').post((req, res) => {
  if (req.isAuthenticated()) {
    Event.findById(req.query.id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result.canAccess.includes(req.user._id)) {
          Event.findByIdAndUpdate(
            req.query.id,
            {
              $push: {
                comments: {
                  author: req.user.firstname + ' ' + req.user.lastname,
                  content: req.body.content,
                  date: new Date(),
                  likes: 0,
                },
              },
            },
            (err, scc) => {
              if (err) {
                console.log(err);
              } else {
                console.log(scc);
                res.redirect(`/event?id=${req.query.id}`);
              }
            }
          );
        } else {
          res.status(401).send('You have no access rights');
        }
      }
    });
  } else {
    res.status(401).redirect('/login');
  }
});

router
  .route('/signup')
  .get((req, res) => {
    res.render('newView/signup');
  })
  .post((req, res) => {
    User.register(
      {
        username: req.body.username,
        firstname: req.body.fname,
        lastname: req.body.lname,
        pendingInvites: 0,
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

// Invites

router
  .route('/invite/new/:id')
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render('newInvite', { eventId: req.params.id });
    } else {
      res.status(401).send('You are not authorized');
    }
  })
  .post();

router
  .route('/invite')

  .get((req, res) => {
    if (req.isAuthenticated()) {
      Invite.findById(req.query.id, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          Event.findById(result.event, (err, foundEvent) => {
            if (err) {
              console.log(err);
            } else {
              res.render('invite', { invite: result, event: foundEvent });
            }
          });
        }
      });
    } else {
      res.status(401).send('You are not authorized');
    }
  })

  .post((req, res) => {
    if (req.isAuthenticated()) {
      console.log(req.body.recipient);
      User.findOne({ username: req.body.recipient }, (err, scc) => {
        if (err) {
          console.log(err);
        } else {
          console.log('found user is: ' + scc);
          let newInvite = new Invite({
            event: req.body.event,
            sender: req.user._id,
            recipient: scc._id,
            message: req.body.message,
            status: 'pending',
            comments: [],
          });
          newInvite.save((err, ans) => {
            if (err) {
              console.log(err);
            } else {
              Event.findByIdAndUpdate(
                req.body.event,
                {
                  $push: {
                    invites: {
                      _id: ans._id,
                    },
                  },
                },
                (err, scc) => {
                  if (err) {
                    console.log(err);
                  } else {
                    User.findOneAndUpdate(
                      {username:req.body.recipient},
                      { $inc: { pendingInvites: 1 } },
                      (err, success) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(success);
                          res.redirect(`/event?id=${req.body.event}`);
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        }
      });
    } else {
      res.status(401).send('You are not authorized');
    }
  });

module.exports = router;
