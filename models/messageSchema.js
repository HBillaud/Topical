const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    msg: {
        type: String
    },
    created: {
        type: Date,
        required: [true, 'Created date is required']
    }
});

module.exports = mongoose.model('Message', messageSchema);