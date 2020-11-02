const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: {
        type: String
    },
    created: {
        type: Date
    }
});

module.exports = mongoose.model('Topic', topicSchema);