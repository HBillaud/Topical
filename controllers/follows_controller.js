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

//exports.checkFollowing


exports.handleFollow = async function(req,res) {

    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var currUserId = (decoded.id).toString();
    
    var otherUserId;
    var check = req.body.press;

    //find user in table
    
    await User.findOne({username: req.params.username}, function(err, user) {
        if (err) {
            console.log("User not found");
            res.redirect("/");
        }

        if (user) otherUserId = (user.id).toString();
    });
    

    var query = {$and: [
        {
            followeeId: otherUserId
        },
        {
            followerId: currUserId
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
                    followeeId: otherUserId,
                    followerId: currUserId
                }).save();
                console.log("Created Follower Tuple")
            }

            res.redirect("/" + req.params.username);
        });

    }
}

