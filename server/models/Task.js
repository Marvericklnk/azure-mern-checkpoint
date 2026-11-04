const mongoose = require('mongoose');
// Store each task in MongoDB, with validation for incoming text.
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  done: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);
