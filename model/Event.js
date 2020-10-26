const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  title: String,
  body: String,

  date: { type: Date, default: Date.now },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  comments: [{ body: String, date: Date }],
  guests: [{ type: Schema.ObjectId, ref: 'User' }],
  type: {
    type: String,
    enum: ['public', 'private'],
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
