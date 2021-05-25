const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  user_sky_id: String,
  title: String,
  url: String,
  description: String,
  image: String,
  remarks: String,
  tag: String,
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [],
  privacy: {
    type: String,
    default: 'public',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  interaction_count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Label', _schema);
