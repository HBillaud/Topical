const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require("../config/auth.config");
const User = require('../models/userSchema');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// recover email 
exports.recover = async function(req, res) {
    await User.findOne({email: req.body.email})
        .then(user => {
            if (!user) return res.status(401).json({message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

            //Generate and set password reset token
            user.generatePasswordReset();

            // Save the updated user object
            user.save()
                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: process.env.FROM_EMAIL,
                        subject: "Password change request",
                        text: `Hi ${user.username} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };

                    sgMail.send(mailOptions, (error, result) => {
                        if (error) return res.status(500).json({message: error.message});

                        res.status(200).json({message: 'A reset email has been sent to ' + user.email + '.'});
                    });
                })
                .catch(err => res.status(500).json({message: err.message}));
        })
        .catch(err => res.status(500).json({message: err.message}));
    res.redirect("/login");
};

//get reset page

exports.reset = async function(req, res) {
    await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Redirect user to form with the email address
            res.render('reset', {user});
        })
        .catch(err => res.status(500).json({message: err.message}));
};

//changes password 
exports.resetPassword = async function(req, res) {
    //hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    await User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});
            
            //Set the new password
            user.password = hash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save
            user.save((err) => {
                if (err) return res.status(500).json({message: err.message});

                // send email
                const mailOptions = {
                    to: user.email,
                    from: process.env.FROM_EMAIL,
                    subject: "Your password has been changed",
                    text: `Hi ${user.username} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                sgMail.send(mailOptions, (error, result) => {
                    if (error) return res.status(500).json({message: error.message});

                    res.status(200).json({message: 'Your password has been updated.'});
                });
            });

            res.redirect("/login");

        });
};

// DONE
exports.signup = async function(req, res) {                                                                  
    try {
        User.findOne({ email: req.body.email })
            .exec((err, user) => {
                if (err) {
                    console.error(err);
                    res.redirect('/signup');
                    return;
                }

                if (user) { // email is already in use
                    console.log('Email already in use!');
                    res.redirect('/signup');
                    return;
                }

                // checking if username is already in use
                User.findOne({ username: req.body.username })
                    .exec((err, user) => {
                        if (err) {
                            console.error(err);
                            res.redirect('/signup');
                            return;
                        }

                        if (user) { // username already in use
                            console.log('Username already in use');
                            res.redirect('/signup');
                            return;
                        }
                    });
            });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.confirmPassword, salt);
       

        var user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            name: req.body.firstname + " " + req.body.lastname,
            bio: null,
            picture: null,
            created: Date.now()
        }).save();

        console.log("Successfully signed up!");
        res.redirect('/login');
        return;
    } catch (err) {
        console.error("Failed to sign up!", err);
        res.redirect('/signup');
        return;
    }
};

// DONE
exports.login = async function(req, res) {
    try {
        var cred = req.body.cred;
        var password = req.body.password;

        if (cred.indexOf('@') > -1) {
            User.findOne({ email: cred}, function(err, user) {
                if (err) { throw err; }
    
                if (!user) {
                    res.redirect('/login');
                    console.log('User does not exist!');
                    return;
                } else {
                    bcrypt.compare(password, user.password, function (err, result) {
                        if (err) throw err;
    
                        if (result) { // passwords match
                            console.log('Successfully logged in!');
                            // generate token
                            const token = jwt.sign({ id: user.id }, config.secret, {
                                expiresIn: 60
                            });
                    
                            res.cookie('x-access-token', token);
                            res.redirect('/');
                            return;
                        } else {
                            console.log('Incorrect password');
                            res.redirect('/login');
                            return;
                        }
                    });
                }
            });
        } else {
            User.findOne({ username: cred}, function(err, user) {
                if (err) { throw err; }

                if (!user) {
                    res.redirect('/login');
                    console.log('User does not exist!');
                    return;
                } else {
                    bcrypt.compare(password, user.password, function (err, result) {
                        if (err) throw err;
    
                        if (result) { // passwords match
                            console.log('Successfully logged in!');
                            // generate token
                            const token = jwt.sign({ id: user.id }, config.secret, {
                                expiresIn: 86400 // 24 hours
                            });
                    
                            res.cookie('x-access-token', token);
                            res.redirect('/');
                            return;
                        } else {
                            console.log('Incorrect password');
                            res.redirect('/login');
                            return;
                        }
                    }); 
                }
            });
        }

    } catch (err) {
        console.error("Failed to log in!", err);
        res.redirect('/login');
    }
};

// DONE
exports.verifyToken = async function(req, res, next) {
    try {
        let token = req.cookies["x-access-token"];

        if (!token) {
            res.redirect('/login');
            console.log('User not logged in!'); 
            next();
        }
        console.log(token);
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                console.log('Unauthorized: invalid token');
                res.redirect('/login');
                next();
            }

            //req.id = decoded.id;
        });
        next();
    } catch (err) {
        console.log('Could not verify token: ', err);
        next();
    }
};

exports.logout = async function(req, res) {
    try {
        // realmApp.currentUser.logOut();
        console.log('User succesfully logged out!');
        res.redirect('/login');
    } catch (err) {
        console.error('Could not log user out', err);
        res.redirect('/settings');
    }
};

exports.delete = async function(req, res) {
    try {
        // realmApp.removeUser(realmApp.currentUser);
        console.log('User deleted!')
        res.redirect('/signup');
    } catch (err) {
        console.error('Could not delete user', err);
        res.redirect('/settings');
    }
};

exports.confirmEmail = async function(req, res) {
    try {
        // extracting token and token id
        const token = req.query.token;
        const tokenId = req.query.tokenId;

        //await realmApp.emailPasswordAuth.confirmUser(token, tokenId);
        console.log('User confirmed!');
        res.redirect('/login');
    } catch (err) {
        console.error('Unsuccessful user confirmation', err);
    }
};

exports.getUser = async function(req, res) {
    try {
        if (req.currentUser) {
            console.log('User not logged in... Redirecting to login');
            res.redirect('/login');
        } else {
            // console.log('Currently logged in as: ' + realmApp.currentUser.id);
            res.render('index');
        }
    } catch (err) {
        console.error('Could not get user info', err);
    }
};

exports.editName = async function(req,res) {
    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var userId = decoded.id;
    var newName = req.body.NameChange;

    const query = {"_id": {$eq: userId}};
    const update = {$set : { "name": newName}}
    const options = { "upsert": false };

    try {
        await User.updateOne(query, update, options).then(() => {
            console.log("Successfully updated");
        });
    } catch {
        console.log("ERROR: update to user failed");
    }
    res.redirect('settings'); //, {user: foundUser});   
}

//Practically identical to editname, can be combined into the same function

exports.editBio = async function(req,res) {
    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var userId = decoded.id;
    var newBio = req.body.BioChange;

    const query = {"_id": {$eq: userId}};
    const update = {$set : { "bio": newBio}}
    const options = { "upsert": false };

    try {
        await User.updateOne(query, update, options).then(() => {
            console.log("Successfully updated");
        });
    } catch {
        console.log("ERROR: update to user failed");
    }
    res.redirect('settings'); //, {user: foundUser});   
}

exports.editPicture = async function(req,res) {
    let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
    var userId = decoded.id;
    var newPic = req.body.PictureURL;


    const query = {"_id": {$eq: userId}};
    const update = {$set : { "picture": newPic}}
    const options = { "upsert": false };

    try {
        await User.updateOne(query, update, options).then(() => {
            console.log("Successfully updated");
        });
    } catch {
        console.log("ERROR: update to user failed");
    }
    res.redirect('settings'); //, {user: foundUser});   
}

exports.forgotPassword = async function(req, res) {
    try {
        var email = req.body.email;
        // await realmApp.emailPasswordAuth.sendResetPasswordEmail(email);
        console.log('Password reset email sent to: ' + email);
        res.redirect('/login');
    } catch (err) {
        console.error('Could not send password reset email', err);
    }
};

/*exports.resetPassword = async function(req, res) {
    try {
        if (req.body.password != req.body.confirmPassword) {
            console.log('Two input fields are different!');
        } else {
            var password = req.body.password;

            // extracting token and token id
            var token = req.query.token;
            var tokenId = req.query.tokenId;

            console.log(token);
            console.log(tokenId);
    
            // await realmApp.emailPasswordAuth.resetPassword(token, tokenId, password);
            console.log('Password reset!');
            res.redirect('/login');    
        }
    } catch (err) {
        console.error('Could not reset password', err);
    }
};*/

exports.updateUser = async function(req, res) {
    try {
        
    } catch (err) {
        console.error('Could not update user data', err);
        res.redirect('/');
    }
};

/*
    Facebook
    const credentials = Realm.Credentials.facebook(token)
    const user = await realmApp.logIn(credentials)

    Google
    const credentials = Realm.Credentials.google(token)
    const user = await realmApp.logIn(credentials)
*/