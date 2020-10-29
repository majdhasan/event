const mongoose = require('mongoose');
const { Schema } = mongoose;

const inviteSchema = new Schema({
  event: { type: Schema.ObjectId, ref: 'Event' },
  sender: {type: Schema.Types.ObjectId,ref: 'User'},
  reveiver: {type: Schema.Types.ObjectId,ref: 'User'},
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted','rejected'],
  },
  comments: [{ body: String, date: Date }]
});

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;
