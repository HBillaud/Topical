const realm = require('realm');

const appId = "topical-gleqy";
const appConfig = {
	id: appId,
	timeout: 10000,
};
const realmApp = new realm.App(appConfig);

exports.signup = async function(req, res) {                                                                  
    try {
        await realmApp.emailPasswordAuth.registerUser(req.body.email, req.body.password);
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