const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  body: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  sent: Date,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
