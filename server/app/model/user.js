const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: 'USER',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', _schema);
