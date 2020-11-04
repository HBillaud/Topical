const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followeeId: {
        type: String
    },
    followerId: {
        type: String
    }
});

module.exports = mongoose.model('Follower', followerSchema);