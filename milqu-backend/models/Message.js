// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String },
  subject:   { type: String, required: true },
  message:   { type: String, required: true },
  status:    { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);