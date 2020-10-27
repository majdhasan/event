const mongoose = require('mongoose');
const { Schema } = mongoose;

const founderSchema = new Schema({
  name: String,
  description: String,
  motto: String,
  avatar: String,
  map: String
});

const Founder = mongoose.model('Founder', founderSchema);

module.exports = Founder;
