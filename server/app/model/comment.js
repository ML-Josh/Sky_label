const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  user_sky_id: String,
  user_name: String,
  user_img: String,
  context: String,
  label_id: String,
}, { timestamps: true });

module.exports = mongoose.model('Comment', _schema);
