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
        console.log(err);
    }
};

exports.delete = async function(req, res) {
    try {
        realmApp.removeUser(realmApp.currentUser);
        res.redirect('signup');
    } catch (err) {
        console.log(err);
    }
};

exports.confirmEmail = async function(req, res) {
    try {
        const email = req.body.email;
        
        // extracting token and token id
        const token = req.query.token;
        const tokenId = req.query.tokenId;

        await realmApp.emailPasswordAuth.confirmUser(token, tokenId);
        console.log('User confirmed!');
        res.redirect('/login');
    } catch (err) {
        console.log(err);
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