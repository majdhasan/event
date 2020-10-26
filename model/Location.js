const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  title: String,
  body: String
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
