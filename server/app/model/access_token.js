const mongoose = require('mongoose');

const _schema = new mongoose.Schema({
  access_token: { type: String, index: true },
  refresh_token: { type: String, index: true },
  new_access_token: { type: String },
  created_at: { type: Date, default: Date.now },
  refresh_at: { type: Date },
  revoked: { type: Boolean },
});

const model = mongoose.model('Access_token', _schema);
module.exports = model;

// 移除index方法
// model.collection.dropIndex({ account_id: 1 });
