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
  comments: [{
    type: Object,
    comment: {
      text: {
        type: String,
        required: true
      },
      author: {
        type: String,
        required: true
      }
    }
  }],
  created: {
    type: Date,
    required: [true, 'Created date is required']
  }
  // Add comment attribute [array of comments]
});

module.exports = mongoose.model('Post', postSchema);