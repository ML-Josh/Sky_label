const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  user_sky_id: {
    type: String,
    index: true,
  },
  title: String,
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', _schema);
