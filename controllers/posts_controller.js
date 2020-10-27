const mongoose = require('mongoose');
const config = require("../config/auth.config");

const User = require('../models/postsSchema');

exports.create = async function(req, res) {
    try {
        


        var post = new Post({
            description: req.body.description,
            img: req.body.img,
            author: req.body.user,
            anonymous: req.body.anonymousCheck,
            created: Date.now()
        }).save();

        console.log("Post successfully created!");
        res.redirect('/');
    } catch (err) {
        console.error("Failed to create post!", err);
    }
};