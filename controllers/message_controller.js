const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

var http = require('http');
var io = require('socket.io')(http);

// const fs = require('fs');
const config = require("../config/auth.config");

const Follower = require('../models/followerSchema');
const User = require('../models/userSchema');
const Message = require('../models/messageSchema');

exports.create = async function(req, res, next) {
    try {
        let token = req.cookies["x-access-token"];
        const decoded = jwt.verify(token, "topical-123456789");  
        var userId = decoded.id;

        // retrieving user's username
        await User.findOne({ _id : userId })
            .exec((err, user) => {
                if (err) throw err;

                if (!user) console.log('No user found');
                else {
                    var name = user.username;
                    console.log('Sender of message: ' + name);

                    var message = new Message({
                        sender: name,
                        receiver: req.body.receiver,
                        msg: req.body.msg,
                        created: Date.now()
                    }).save();  // creating message in DB

                    var i = 0;
                    //search for reciever name in inbox
                    for (i; i < user.inbox.length; i++) {
                        if (user.inbox[i] == req.body.receiver) break;
                    }
                    if (i >= user.inbox.length) {
                         //add reciever name to inbox
                        User.findByIdAndUpdate(
                            {_id: userId},
                            {$push: {inbox: req.body.receiver}
                        }).exec((err, result) =>  {
                            if (err) throw err;
    
                            if (!result) console.log('Could not save receiver');
                        });
                    }

                    User.findOne({ username : req.body.receiver })
                        .exec((err, otherUser) => {
                        
                        if (err) throw err;
                        else if (otherUser) {
                            
                            console.log('Receiver of message: ' + req.body.receiver);
                            var j = 0;
                            //search for sender's name in inbox
                            for (j; j < otherUser.inbox.length; j++) {
                                if (otherUser.inbox[j] == req.body.receiver) break;
                            }
                            if (j >= otherUser.inbox.length) {
                                 //add sender's name to inbox
                                User.findByIdAndUpdate(
                                    {_id: otherUser.id},
                                    {$push: {inbox: name}
                                }).exec((err, result) =>  {
                                    if (err) throw err;
            
                                    if (!result) console.log('Could not save sender');
                                });
                            }

                            console.log("Message successfully created!");
                            res.redirect('/messages');
                        }
                    });
                    //res.redirect('/message' + req.body.receiver + "/");
                }
            });

    
    } catch (err) {
        console.error("Failed to send message!", err);
    }
    next();
};


exports.respond = async function(req, res, next) {
    try {
        var sender = req.body.submit;
        var rcvr = req.params.username;

        var message = new Message({
            sender: sender,
            receiver: rcvr,
            msg: req.body.msg,
            created: Date.now()
        }).save()
        /*(err) =>{
            if(err)
              sendStatus(500);
            io.emit('message', req.body);
            console.log("Message successfully created!");
            res.sendStatus(200);
          });*/
        
        io.emit('message', req.body);
        console.log("Message successfully created!");
        
        res.redirect('/messages/' + rcvr + '/');

    } catch (err) {
        console.error("Failed to send message!", err);
    }
    next();
};