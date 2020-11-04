const mongoose = require('mongoose');
const config = require("../config/auth.config");
const Topic = require('../models/topicSchema');
const Post = require('../models/postSchema');

exports.check = async function(req, res, next) {
    await Topic.findOne({ title: req.body.topic })
        .exec((err, result) => {
            if (err) throw err;
            
            if (!result) {  // Topic doesn't exist
                var topic = new Topic({
                    title: req.body.topic,
                    numPosts: 1,
                    created: Date.now()
                }).save();    // storing new topics in DB 

                console.log('Topic { ' + req.body.topic + ' } succesfully created!')
            } // else increment the numPosts of existing topic
            else {
                var filter = { title: req.body.topic };
                var increment = result.numPosts + 1;
                var update = { numPosts: increment}
                Topic.findOneAndUpdate(filter, update)
                    .exec((err, result) => {
                        if (err) throw err;
                        else if (result) {
                            console.log('NumPosts of { ' + result.title + ' } was successfully updated!');
                        }
                    });
            }
        });
    next();
};

exports.fetch = async function(req, res) {
    // retrieve topic selected by user - req.params.topicId
    // query all posts with that specific topic
    // send array of posts to frontend to display 
    await Topic.findOne({ _id: req.params.topicId })
        .exec((err, result) => {
            if (err) throw err;

            if (!result)    console.log('No corresponding topic found');
            else {
                Post.find({ topic: result.title })
                    .exec((err, result) => {
                        if (err) throw err;

                        if (!result) console.log('No posts under { ' + result.title + ' } were found!');
                        else {
                            
                        }
                    })
            }
        })
};