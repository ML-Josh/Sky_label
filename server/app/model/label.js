const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  user_sky_id: String,
  title: String,
  url: String,
  description: String,
  image: String,
  remarks: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  comment_ids: [String],
  privacy: {
    type: String,
    default: 'public',
  },
  interaction_count: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Label', _schema);
