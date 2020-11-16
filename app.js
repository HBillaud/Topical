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
const Follower = require('./models/followerSchema');


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

app.get('/profile', users.verifyToken, async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	var followersList = new Array();
	var followingList = new Array();

	await User.findById(currUserId, async function(err, foundUser) {
		// get followers, query { followeeName: username }
		await Follower.find({ followeeName: foundUser.username, isUser: true })
			.exec((err, list) => {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followersList = list;
					console.log('followerList length: ' + followersList.length);
					console.log('list length: ' + list.length);
				}
			});

		// get following, query { followerName: username }
		await Follower.find({ followerName: foundUser.username, isUser: true })
			.exec((err, list) => {
				if (err) throw err;

				if (!list) {
					console.log('No following found');
				} else {
					console.log('Found list of following');
					followingList = list;
					console.log('followingList length: ' + followingList.length);
					console.log('list length: ' + list.length);
				}
			});
		
		res.render('profile', { user: foundUser, followers: followersList, following: followingList });
	}).catch(err => res.status(500).json({message: err.message}));
});

app.get('/confirmEmail', users.confirmEmail, function(req, res) {
	res.render('confirmEmail');
});

app.get('/topics', users.verifyToken, async function(req, res) {
	// query all existing topics from DB
	// send result to frontend to display

    await Topic.find({ })
        .exec((err, result) => {
            if (err) { 
				console.log(err);
				return; 
			}

            if (result) {
                console.log('{ ' + result.length + ' } topics were fetched');
                // send array of topics to frontend to display
                res.render('topics', {topics: result});
            }
        });
});

app.get('/topics/:topicTitle/', async function(req, res) {
	// retrieve topic selected by user - req.params.topicId
    // query all posts with that specific topic
	// send array of posts to frontend to display 
	await Post.find({ topic: req.params.topicTitle })
        .exec((err, posts) => {
            if (err)  throw err;
            if (!posts) console.log('No posts found!');
            else {
				Topic.find({ })
					.exec((err, result) => {
						res.render('topicsFetch', {topics: result, posts: posts});
					});
            }
        });
});

app.get('/settings', users.verifyToken, function(req, res) {
	res.render('settings');
});

app.post('/topics/:topicTitle/:postId/upvote', posts.upvote);
app.post('/topics/:topicTitle/:postId/downvote', posts.downvote);

app.post('/signup', users.signup);
app.post('/login', users.login);
app.post('/logout', users.logout);
app.post('/delete', users.delete);
app.post('/settings', users.updateUser);

// password reset routes
app.get('/forgotPassword',  function(req, res) {
	res.render('forgotPassword');
});

app.post('/recoverPassword', users.recover);

app.get('/reset/:token', users.reset);

app.post('/reset/:token', [
	check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
	check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password))	
], users.resetPassword);

app.post('/createPost', posts.create, topics.check);

app.post('/search', users.searchUser);

//settings edit routes
app.post('/editName', users.editName);
app.post('/editBio', users.editBio);
app.post('/editPicture', users.editPicture);


app.get('/:username', users.verifyToken, async function(req, res) {
	// get selected user's profile

	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = (decoded.id);

	var otherUserId;

	//find user in table
	await User.findOne({username: req.params.username}, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) otherUserId = (user.id);
	});

	if (otherUserId != undefined) {
		//check if logged in user is following this user
		var isFollow;
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
				if (err) console.log("Follower not found");

				if (result) isFollow = true;
				else isFollow = false;
				
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
	}
	else { //query failed for otherUserId
		res.redirect("/" + req.params.username)
	}

});
app.post('/:username', follows.handleFollow);


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});