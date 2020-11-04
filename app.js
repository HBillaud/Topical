const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {check} = require('express-validator');


const jwt = require('jsonwebtoken');
//const config = require("../config/auth.config");



var app = express();

// Including all controllers
var users = require('./controllers/users_controller');
var posts = require('./controllers/posts_controller');
var topics = require('./controllers/topics_controller');
var follows = require('./controllers/follows_controller');

const { ppid } = require('process');

// Including all schemas
const User = require('./models/userSchema');
const Post = require('./models/postSchema');
const Topic = require('./models/topicSchema');
const Follower = require(__dirname + '/models/followerSchema');


const ATLAS_URI = "mongodb+srv://HBillaud:Floride09@cluster.oye5v.mongodb.net/usersdb?retryWrites=true&w=majority";

mongoose.Promise = global.Promise;
mongoose.connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('connection succesful'))
	.catch((err) => console.error(err));

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.set('views', __dirname + "/views");

// set the view engine to ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/assets'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/controllers'));

// set the home page route
app.get('/', users.verifyToken, function(req, res) {
	res.render('index');
});

app.get('/signup', function(req, res) {
	res.render('signup');
});

app.get('/login', function(req, res) {
	res.render('login');
});

/*app.get('/profile', users.verifyToken, function(req, res) {
	res.render('profile');
});*/

app.get('/profile', users.verifyToken, async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;

	await User.findById(currUserId, function(err, foundUser) {
		res.render('profile', {user: foundUser});
	}).catch(err => res.status(500).json({message: err.message}));
});

app.get('/user/:id', users.verifyToken, async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;

	var otherUserId = req.params.id;
	
	var isFollow = false;
	await Follower.findOne({
		$and: [
			{
				followeeId: otherUserId
			},
			{
				followerId: currUserId
			}
		]},
		function(err, result) {
			if (result) isFollow = true;
		});

	await User.findById(otherUserId, function(err, foundUser) {		
		if(err || foundUser == null) {
			//req.flash("error", "Something went wrong.");
			return res.redirect("/");
		  }

		if (currUserId == otherUserId) {
			res.render('profile', {user: foundUser});
		}
		else {
			res.render('user', {user: foundUser, isFollowing: isFollow });
		}
	});
})

//followers routes
app.post('/user/:id', follows.handleFollow );
//app.post('/unfollowUser', Follower.unfollow);

app.get('/confirmEmail', users.confirmEmail, function(req, res) {
	res.render('confirmEmail');
});

app.get('/topics', users.verifyToken, function(req, res) {
	res.render('topics');
});

app.get('/settings', users.verifyToken, function(req, res) {
	res.render('settings');
});


app.post('/signup', users.signup);
app.post('/login', users.login);
app.post('/logout', users.logout);
app.post('/delete', users.delete);
app.post('/settings', users.updateUser);

// password reset routes
app.get('/forgotPassword',  function(req, res) {
	res.render('forgotPassword');
});
//app.post('/forgotPassword', users.forgotPassword);

app.post('/recoverPassword', users.recover);

app.get('/reset/:token', users.reset);

app.post('/reset/:token', [
	check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
	check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password))	
], users.resetPassword);

app.post('/createPost', posts.create, topics.check);

app.post('/editName', users.editName);
app.post('/editBio', users.editBio);
app.post('/editPicture', users.editPicture);

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});