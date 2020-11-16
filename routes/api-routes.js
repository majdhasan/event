const express = require('express');
const passport = require('passport');
const Event = require('../model/Event');
const User = require('../model/User');
const Founder = require('../model/Founder');
const Invite = require('../model/Invite');
const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
var jwt = require('jsonwebtoken');

const apiRouter = express.Router();

// ------------------------------------ Utilities ----------------------------------------

const verifyToken = (req, res, next) => {
console.log(req.headers['authorization']);
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const [bearer, token] = bearerHeader.split(' ');

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
    console.log("i arrived here");
    res.sendStatus(403);
  }
};  

// ------------------------------------ Routes ----------------------------------------

// ------- Authentication/Authorization ------------------

apiRouter.route('/login').post((req, res) => {
  if (req.body.username && req.body.password) {
    let user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) throw err;
      passport.authenticate('local')(req, res, () => {
        jwt.sign({ user: req.user }, process.env.PRIVATEKEY, (err, token) => {
          if (err) console.log(err);
          if (token) {
            res.status(200).json({ token: token, user: req.user });
          }
        });
      });
    });
  } else {
    res.sendStatus(404);
  }
});

apiRouter.route('/signup').post((req, res) => {
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
        jwt.sign({ user: result }, process.env.PRIVATEKEY, (err, token) => {
          if (err) console.log(err);
          if (token) {
            res.json({ token });
          }
        });
      }
    }
  );
});

// ------------------------------------ Restricted Routes ----------------------------------------------------------------

// --------------------- User Info Route -------------------

apiRouter.route('/user').get(verifyToken, (req, res) => {
  res.json({ user: req.user });
});

apiRouter.route('/user/:id').get(verifyToken, (req, res) => {
  User.findById(req.params.id, (err, result) => {
    if (err) res.sendStatus(404);
    res.json(result);
  });
});

// --------------------- Event Route -------------------

apiRouter
  .route('/event')
  // Returns all the event of the user associated with the token.
  .get(verifyToken, (req, res) => {
    Event.find({ creator: req.user._id }, (err, events) => {
      if (err) throw err;
      res.json(events);
    });
  })

  // Creats a new Event and get assigned to the user associated with the token
  .post(verifyToken, (req, res) => {
    let newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      type: req.body.eventType,
      street: req.body.street,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      creator: req.user._id,
      date: req.body.date,
      lookingFor: req.body.lookingFor,
      comments: [],
      canAccess: [req.user._id],
      invites: [],
    });

    newEvent.save((err, result) => {
      if (err) throw err;
      res.sendStatus(200);
    });
  })
  .delete(verifyToken, (req, res) => {
    const eventId = req.query.id;
    Event.findById(eventId, (err, result) => {
      if (err) throw err;
      if (result.creator == req.user._id) {
        result.remove({}, (err, response) => {
          if (err) throw err;
          res.json(response);
        });
      } else {
        res.sendStatus(403);
      }
    });
  });

apiRouter
  .route('/event/:id')

  // Return if found the Event with the given ID.
  // a requirment to return the event is that the user (token assocuiated) is in the has access array of the Event
  .get(verifyToken, (req, res) => {

    const eventId = req.params.id;

    Event.findById(eventId, (err, result) => {
      if (err) throw err;
      if (result.canAccess.includes(req.user._id)) {
        res.json(result);
       
      } else {
        res.sendStatus(403);
      }
    });
  });

// --------------------- Chat Routes -------------------
apiRouter
  .route('/chat/:id')

  // Get a conversation
  // the response is the name of the partner as String and array of the messages
  .get(verifyToken, (req, res) => {
    const conversationId = req.params.id;
    Conversation.findById(conversationId, (err, conv) => {
      if (err) throw err;
      const response = { messages: conv.messages };
      if (conv.members.includes(req.user._id)) {
        res.json(response);
      } else {
        res.sendStatus(403);
      }
    });
  })

  // Create new conversation
  // Need to send a token and the id of the new partner
  .post(verifyToken, (req, res) => {
    const senderId = req.user._id;
    const recieverId = req.params.id;
    const senderName = req.user.firstname + ' ' + req.user.lastname;

    let newConversation = new Conversation({
      members: [senderId, recieverId],
      messages: [],
    });
    newConversation.save((err, newConvSaved) => {
      if (err) throw err;
      User.findByIdAndUpdate(
        recieverId,
        {
          $push: {
            conversations: {
              conversation: newConvSaved._id,
              partner: senderName,
            },
          },
        },
        (err, reciever) => {
          if (err) throw err;
          const recieverName = reciever.firstname + ' ' + reciever.lastname;
          User.findByIdAndUpdate(
            senderId,
            {
              $push: {
                conversations: {
                  conversation: newConvSaved._id,
                  partner: recieverName,
                },
              },
            },
            (err) => {
              if (err) throw err;
              console.log(
                `created a new conversation between ${senderId} and ${recieverId}`
              );
              res.json(newConversation);
            }
          );
        }
      );
    });
  });

apiRouter
  .route('/message/:id')

  .post(verifyToken, (req, res) => {
    const senderId = req.user._id;
    const content = req.body.message;
    const conversationId = req.params.id;

    Conversation.findById(conversationId, (err, conv) => {
      if (err) throw err;
      if (conv.members.includes(senderId)) {
        const newMessage = {
          content: content,
          sender: senderId,
        };
        conv.messages.push(newMessage);
        conv.save((err, conversation) => {
          if (err) return handleError(err);
          res.json(conversation);
        });
      } else {
        res.sendStatus(403);
      }
    });
  });

// ------------------------------------ END OF API ----------------------------------------
module.exports = apiRouter;
