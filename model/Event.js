const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  title: String,
  body: String,
  descriptionForSupplier: String,
  street: String,
  city: String,
  zip: String,
  country: String,
  date: { type: Date, default: Date.now },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  partners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      author: String,
      content: String,
      date: { type: Date, default: Date.now },
      likes: Number,
    },
  ],
  invites: [{ type: Schema.ObjectId, ref: 'Invite' }],
  canAccess: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, enum: ['public', 'private'] },
  lookingFor: String,
  guestAmount: Number,
});

const Event = mongoose.model('Event', eventSchema);
  
module.exports = Event;
