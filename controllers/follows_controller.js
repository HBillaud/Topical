const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const config = require("../config/auth.config");
const Follower = require('../models/followerSchema');

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
    
    var otherUserId = (req.params.id).toString();

    var check = req.body.press;

    var query = {$and: [
        {
            followeeId: otherUserId
        },
        {
            followerId: currUserId
        }
    ]};

    await Follower.findOne(query, function(err, result) {
        
            if ((result) && check == "unfollowUser") { //add follower
                console.log("hi from delete result id: " + result.id);
                Follower.findOneAndDelete(query, function (err, docs) { 
                    if (err){ 
                        console.log(err) 
                    } 
                    else{ 
                        console.log("Deleted User : ", docs); 
                        res.redirect("/user/" + req.params.id);
                    }
                });
            }
            else if (check == "followUser" && (result == null)) {
                    var follower = new Follower({
                        followeeId: otherUserId,
                        followerId: currUserId
                    }).save();

                    res.redirect("/user/" + req.params.id);
            }

    }).catch(err => res.status(500).json({message: err.message}));

}

