exports.signup = function(req, res) {

    var user = new User({name:req.body.name},
                        {userID:req.body.userID},
                        {email:req.body.email},
                        {password:req.body.password});
                        
                                            
    if (user) {
        realmApp.emailPasswordAuth.registerUser(user.email, user.password);
        console.log("Realm user created");
    } else {
        console.log("User could not be created!");
    }    

    if (err) {
        res.sessor.error = err;
        res.render('/registration');
    } else {
        res.render('/index');
    }
};