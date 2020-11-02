const mongoose = require('mongoose');
// const fs = require('fs');
const config = require("../config/auth.config");

const Post = require('../models/postSchema');

exports.create = async function(req, res) {
    try {
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
            author: "HBillaud",
            anonymous: anonymous,
            created: Date.now()
        }).save();  // creating post in DB

        console.log("Post successfully created!");
        res.redirect('/');
    } catch (err) {
        console.error("Failed to create post!", err);
    }
};