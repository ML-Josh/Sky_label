const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: String,
  title: String,
  url: { type: String, required: true },
  url_encode: String,
  host: String,
  hash: String,
  utm: String,
  description: String,
  image: String,
  image_width: Number,
  image_height: Number,
  remarks: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  comment_ids: [String],
  privacy: { type: String, default: 'public' },
  interaction: { type: Number, default: 0 },
  fav_count: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Label', _schema);
