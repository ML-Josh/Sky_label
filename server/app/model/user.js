const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  sky_id: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  name: { type: String, required: true },
  image: { type: String },
  password: { type: String },
  role: { type: String, required: true, default: 'USER' }, // USER || ADMIN
  label_count: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', _schema);
