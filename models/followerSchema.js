const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followeeName: {
        type: String
    },
    followerName: {
        type: String
    },
    IsUser: {
        type: Boolean
    }
});

module.exports = mongoose.model('Follower', followerSchema);