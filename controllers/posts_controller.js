const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// const fs = require('fs');
const config = require("../config/auth.config");

const Post = require('../models/postSchema');
const User = require('../models/userSchema');
const { update } = require('../models/postSchema');

exports.create = async function(req, res, next) {
    try {
        let token = req.cookies["x-access-token"];
        const decoded = jwt.verify(token, "topical-123456789");  
        var userId = decoded.id;

        // retrieving user's username
        User.findOne({ _id : userId })
            .exec((err, user) => {
                if (err) throw err;

                if (!user) console.log('No user found');
                else {
                    var name = user.username;
                    console.log(user.username);
                    console.log('Author of post: ' + name);
                    var anonymous = false;
                    if (req.body.anonymousCheck == "1") { anonymous = true; }

                    var post = new Post({
                        title: req.body.title,
                        topic: req.body.topic,
                        description: req.body.description,
                        /*
                        img: { 
                            data: fs.readFileSync(req.file.path),
                            contentType: 'image/png'
                        },
                        */
                        img: req.body.imgURL,
                        author: name,
                        anonymous: anonymous,
                        score: 0,
                        created: Date.now()
                    }).save();  // creating post in DB
                }
            });

        console.log("Post successfully created!");
        res.redirect('/');
    } catch (err) {
        console.error("Failed to create post!", err);
    }
    next();
};

exports.upvote = async function(req, res) {
    // retrieve post id - req.params.postId
    // query db for specific post using id
    // increment the post's score
    console.log('postId { ' + req.params.postId + ' }');
    await Post.findOne({ _id : req.params.postId})
        .exec((err, post) => {
            if (err) throw err;

            if (!post) console.log('Post with id { ' + req.params.postId + ' } not found');
            else {
                var increment = post.score + 1;
                var update = { score: increment };
                Post.findOneAndUpdate({ _id : req.params.postId} , update)
                    .exec((err, result) => {
                        if (err) throw err;

                        if (!result) console.log('Upvote of post unsuccessful');
                        else {
                            // implement response
                            console.log('Score updated!');
                            res.redirect('/topics/'+req.params.topicTitle+'/');
                        }
                    });
            }
        });
};

exports.downvote = async function(req, res) {
    // retrieve post id - req.params.postId
    // query db for specific post using id
    // increment the post's score
    await Post.findOne({ _id : req.params.postId})
        .exec((err, post) =>  {
            if (err) throw err;

            if (!post) console.log('Post with id { ' + req.params.postId + ' } not found');
            else {
                var decrement = post.score - 1;
                var update = { score: decrement};
                Post.findOneAndUpdate({ _id : req.params.postId }, update)
                    .exec((err, result) => {
                        if (err) throw err;

                        if (!result) console.log('Downvote of post unsuccessful');
                        else {
                            // implement response
                            console.log('Score updated!');
                            res.redirect('/topics/'+req.params.topicTitle+'/');
                        }
                    })
            }
        })
};

exports.delete = async function(req, res) {
    // retrieve post id - req.params.postId
    // query db for findOneAndDelete()
    await Post.findOneAndDelete({ _id: req.params.postId })
        .exec((err, post) => {
            if (err) throw err;

            if (!post) console.log('Post with id { ' + req.params.postId + ' } not found');
            else {
                // implement response
                console.log('Post with id { ' + req.params.postId + ' } deleted');
                // res.redirect('/topics/'+req.params.topicTitle+'/');
            }
        });
};

exports.save = async function(req, res) {
    // retrieve post id - req.params.postId
    // query db for user with findOnebyId
    // push post to array of saved post
    let token = req.cookies["x-access-token"];
    const decoded = jwt.verify(token, "topical-123456789");  
    var userId = decoded.id;

    await Post.findOne({ _id: req.params.postId })
        .exec((err, post) => {
            if (err) throw err;

            if (!post) console.log('post no longer exists');
            else {
                var update = { $push: { savedPosts: post }};
                User.findByIdAndUpdate({ _id: userId }, update)
                    .exec((err, result) =>  {
                        if (err) throw err;

                        if (!result) console.log('Could not save post');
                        else {
                            // implement response
                            res.redirect('/topics/'+req.params.topicTitle+'/');
                        }
                    })
            }
        });
};