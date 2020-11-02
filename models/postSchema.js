const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String
  },
  topic: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  /*
  img: {
    data: Buffer,
    contentType: String
  },
  */
 img: {
    type: String
  },
  author: {
    type: String,
    required: true
  },
  anonymous: {
    type: Boolean
  },
  score: {
    type: Number
  },
  created: {
    type: Date,
    required: [true, 'Created date is required']
  }
  // Add comment attribute [array of comments]
});

module.exports = mongoose.model('Post', postSchema);