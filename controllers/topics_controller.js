const mongoose = require('mongoose');
const config = require("../config/auth.config");
const Topic = require('../models/topicSchema');

exports.check = async function(req, res, next) {
    await Topic.findOne({ title: req.body.topic })
        .then(result => {
            // Topic doesn't exit
            if (!result) {
                var topic = new Topic({
                    title: req.body.topic,
                    created: Date.now()
                }).save();    // storing new topics in DB 

                console.log('Topic { ' + req.body.topic + ' } succesfully created!')
            } // else do nothing
        });
    next();
};