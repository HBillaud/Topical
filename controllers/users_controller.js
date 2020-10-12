const realm = require('realm');
// const bcrypt = require('bcrypt');

const appId = "topical-gleqy";
const appConfig = {
	id: appId,
	timeout: 10000,
};
const realmApp = new realm.App(appConfig);

exports.signup = async function(req, res) {                                                                  
    try {
        // const salt = await bcrypt.genSalt(5);
        // const hash = await bcrypt.hash(req.boby.password, salt);
        await realmApp.emailPasswordAuth.registerUser(req.body.email, req.body.password); // replace req.body.password with hash
        console.log("Successfully signed up!");
        res.redirect('/login');
    } catch (err) {
        console.error("Failed to sign up!", err);
        res.redirect('/signup');
    }    
};

exports.login = async function(req, res) {
    try {
        const credentials = Realm.Credentials.emailPassword(req.body.email, req.body.password);
        const user = await realmApp.logIn(credentials);
        console.log('Successfully logged in as: ' + user.id);
        res.redirect('/');
        return user;
    } catch (err) {
        console.error("Failed to log in!", err);
        res.redirect('/login');
    }

    // console.log("Successfully logged in as: " + realmApp.currentUser.id);
    // Creation of a User object locally to store user's data
    /*
    var user = new User({name:req.body.name},
        {userID:req.body.userID},
        {email:req.body.email},
        {password:req.body.password});
        */
};

exports.logout = async function(req, res) {
    try {
        realmApp.currentUser.logOut();
        console.log('User succesfully logged out!');
        res.redirect('login');
    } catch (err) {
        console.error('Could not log user out', err);
    }
};

exports.delete = async function(req, res) {
    try {
        realmApp.removeUser(realmApp.currentUser);
        console.log('User deleted!')
        res.redirect('signup');
    } catch (err) {
        console.error('Could not delete user', err);
    }
};

exports.confirmEmail = async function(req, res) {
    try {
        // extracting token and token id
        const token = req.query.token;
        const tokenId = req.query.tokenId;

        await realmApp.emailPasswordAuth.confirmUser(token, tokenId);
        console.log('User confirmed!');
        res.redirect('/login');
    } catch (err) {
        console.error('Unsuccessful user confirmation', err);
    }
};

exports.getUser = async function(req, res) {
    try {
        if (!realmApp.currentUser) {
            console.log('User not logged in... Redirecting to login');
            res.redirect('/login');
        } else {
            console.log('Currently logged in as: ' + realmApp.currentUser.id);
            res.render('index');
        }
    } catch (err) {
        console.error('Could not get user info', err);
    }
};

exports.forgotPassword = async function(req, res) {
    try {
        var email = req.body.email;
        await realmApp.emailPasswordAuth.sendResetPasswordEmail(email);
        console.log('Password reset email sent to: ' + email);
        res.redirect('/login');
    } catch (err) {
        console.error('Could not send password reset email', err);
    }
};

exports.resetPassword = async function(req, res) {
    try {
        if (req.body.password != req.body.confirmPassword) {
            console.log('Two input fields are different!');
        } else {
            var password = req.body.password;

            // extracting token and token id
            var token = req.query.token;
            var tokenId = req.query.tokenId;
    
            await realmApp.emailPasswordAuth.resetPassword(token, tokenId, password);
            console.log('Password reset!');
            res.redirect('/login');    
        }
    } catch (err) {
        console.error('Could not reset password', err);
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