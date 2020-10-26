const mongoose = require('mongoose');
const { Schema } = mongoose;

const inviteSchema = new Schema({
  event: String,
  body: String,
  status: {
    type: String,
    enum: ['pending', 'accepted','rejected'],
  },
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

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
