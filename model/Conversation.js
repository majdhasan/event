const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  content: String,
  date: { type: String, default: new Date() },
  sender: String,
});

const conversationSchema = new Schema({
  messages: [messageSchema],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;