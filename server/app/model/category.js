const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: {
    type: String,
    index: true,
  },
  title: String,
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
}, { timestamps: true });

module.exports = mongoose.model('Category', _schema);
