const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: String,
  firstname: String,
  lastname: String,
  conversations: [
    [
      {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',

      },
    ],
  ],
  type: {
    type: String,
    enum: ['costumer', 'supplier'],
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'diverse'],
  },
  pendingInvites: Number,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;
