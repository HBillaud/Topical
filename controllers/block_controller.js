const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
// const fs = require('fs');
const config = require("../config/auth.config");


const Follower = require('../models/followerSchema');
const User = require('../models/userSchema');
const Block = require('../models/blockSchema');

exports.handleBlock = async function(req,res) {

    console.log("blocking user");

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();
    
    //get blockee name
    var blockeeName = req.body.onpress;

    var blockerName;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) blockerName = (user.username);
	});
    

    var query = {$and: [
        {
            blockee: blockeeName
        },
        {
            blocker: blockerName
        }
    ]};

    //block user
    var block;
    await Block.findOne(query, function(err, result) {
        if (err){ 
            console.log(err);
        } 

        if ((!result) || result == "") {
            block = new Block({
                blockee: blockeeName,
                blocker: blockerName,
            }).save();
            console.log("Created Block Tuple")

            var query2 = {$and: [
                {
                    followeeName: blockeeName
                },
                {
                    followerName: blockerName
                }
            ]};

            console.log("blockeeName: " + blockeeName + "blockername: " + blockerName);
            //remove follower
            Follower.findOneAndDelete(query2, function (err, docs) { 
                if (err){ 
                    console.log(err);
                } 
                else if (docs) { 
                    console.log("Deleted Follower Tuple : ", docs); 
                }
                    
                //Change this to reflect actual redirect
                res.redirect("/" + blockeeName);
            });
        }
    });
}

exports.handleUnblock = async function(req,res) {

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();
    
    //get blockee name
    var blockeeName = req.body.onpress;

    var blockerName;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) blockerName = (user.username);
	});
    

    var query = {$and: [
        {
            blockee: blockeeName
        },
        {
            blocker: blockerName
        }
    ]};

    //unblock user
    await Block.findOneAndDelete(query, function (err, docs) { 
        if (err){ 
            console.log(err);
        } 
        else if (docs) { 
            console.log("Removed Block Tuple : ", docs); 
        }
        //Change this to reflect actual redirect
        res.redirect("/" + blockeeName);
    });
}