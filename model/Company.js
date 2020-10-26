const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
  name: String,
  body: String,
  type: {
    type: String,
    enum: ['public', 'private'],
  },
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
