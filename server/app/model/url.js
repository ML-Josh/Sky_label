const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  url: String,
  title: String,
  description: String,
  image: String,
  remarks: String,
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Url', _schema);
