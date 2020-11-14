const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Follower = require('../models/followerSchema');
const User = require('../models/userSchema');

/*
followerSchema {
followeeId
followerId
}
*/

exports.handleUserFollow = async function(req,res) {

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();
    
    //check if it is a follow or unfollow request
    var check = req.body.press;

    var currentUsername;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) currentUsername = (user.username);
	});
    

    var query = {$and: [
        {
            followeeName: req.params.username
        },
        {
            followerName: currentUsername
        }
    ]};

    if (check == "unfollowUser") { //remove follower
        await Follower.findOneAndDelete(query, function (err, docs) { 
            if (err){ 
                console.log(err);
            } 
            else if (docs) { 
                console.log("Deleted Follower Tuple : ", docs); 
            }
            res.redirect("/" + req.params.username);
        });
    }
    else if (check == "followUser") { //add follower
        var follower;
        await Follower.findOne(query, function(err, result) {
            if (err){ 
                console.log(err);
            } 

            if ((!result) || result.id == undefined) {
                follower = new Follower({
                    followeeName: req.params.username,
                    followerName: currentUsername,
                    IsUser: true
                }).save();
                console.log("Created Follower Tuple")
            }

            res.redirect("/" + req.params.username);
        });

    }
}

exports.handleTopicFollow = async function(req,res) {

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();

    var currentUsername;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) currentUsername = (user.username);
	});

    var query = {$and: [
        {
            followeeName: req.params.topicTitle
        },
        {
            followerName: currentUsername
        }
    ]};

    var follower;
    await Follower.findOne(query, function(err, result) {
        if (err){ 
            console.log(err);
        } 

        if ((!result)) {
            follower = new Follower({
                followeeName: req.params.topicTitle,
                followerName: currentUsername,
                IsUser: false
            }).save();
            console.log("Created Follower Tuple")
        }

        res.redirect("/topics/" + req.params.topicTitle + "/");
    });
}

exports.handleTopicUnfollow = async function(req,res) {

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();

    var currentUsername;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) currentUsername = (user.username);
	});

    var query = {$and: [
        {
            followeeName: req.params.topicTitle
        },
        {
            followerName: currentUsername
        }
    ]};

    await Follower.findOneAndDelete(query, function (err, docs) { 
        if (err){ 
            console.log(err);
        } 
        else if (docs) { 
            console.log("Deleted Follower Tuple : ", docs); 
        }
        res.redirect("/topics/" + req.params.topicTitle + "/");
    });

}