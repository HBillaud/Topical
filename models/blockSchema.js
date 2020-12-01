const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blocker: {
        type: String
    },
    blockee: {
        type: String
    },
});

module.exports = mongoose.model('Block', blockSchema);