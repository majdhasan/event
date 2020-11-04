const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  street: String,
  streetNumber: String,
  city: String,
  zip: Number,
  additional: String
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
