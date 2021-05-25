const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
  label_ids: [],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Tag', _schema);
