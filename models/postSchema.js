const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  img: {
    data: Buffer,
    contentType: String
  },
  created: {
    type: Date,
    required: [true, 'Created date is required']
  }
});

module.exports = mongoose.model('Post', postSchema);