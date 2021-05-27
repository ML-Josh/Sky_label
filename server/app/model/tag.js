const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  title: String,
  sky_id: String,
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
}, { timestamps: true });

module.exports = mongoose.model('Tag', _schema);
