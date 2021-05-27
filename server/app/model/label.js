const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: String,
  title: String,
  url: { type: String, required: true },
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
  likes: {
    type: Number,
    default: 0,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Label', _schema);
