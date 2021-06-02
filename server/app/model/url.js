const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  url: String,
  url_encode: String,
  protocol: String,
  host: String,
  title: String,
  description: String,
  image: String,
  image_width: Number,
  image_height: Number,
  fav_count: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Url', _schema);
