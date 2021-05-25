const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  title: String,
  user_sky_id: String,
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
}, { timestamps: true });

module.exports = mongoose.model('Tag', _schema);
