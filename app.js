const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const {check} = require('express-validator');
var io = require('socket.io')(http);

const jwt = require('jsonwebtoken');
//const config = require("../config/auth.config");

io.on('connection', () =>{
	console.log('a user is connected');
})

var app = express();

// Including all controllers
var users = require('./controllers/users_controller');
var posts = require('./controllers/posts_controller');
var topics = require('./controllers/topics_controller');
var follows = require('./controllers/follows_controller');
var message = require('./controllers/message_controller');
var block = require('./controllers/block_controller');

const { ppid } = require('process');

// Including all schemas
const User = require('./models/userSchema');
const Post = require('./models/postSchema');
const Topic = require('./models/topicSchema');
const Follower = require('./models/followerSchema');
const Message = require('./models/messageSchema');
const Block = require('./models/blockSchema');

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
	res.redirect('/profile/userline');
});

app.get('/profile/userline', async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	
	var followerCount, followingCount;
	await User.findById(currUserId, async function(err, foundUser) {
		// get all posts with author: user.username
		// retrieve follower/following counts
		await Follower.find({ followeeName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followerCount = list.length;
				}
			});

		await Follower.find({ followerName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followingCount = list.length;
				}
			});

		await Post.find({ author: foundUser.username })
			.exec((err, posts) => {
				if (err) throw err;

				else if (!posts) {
					console.log('No posts found');
				} else {
					console.log('User posts found');
					res.render('timeline', {user: foundUser, timeline: posts, followerCount: followerCount, followingCount: followingCount});
				}
			});
	});
});

app.get('/profile/timeline', async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	
	//TODO: return this to timeline instead of timeline2 
	// if you want the sexy profile ejs
	// so add your counts and other necessary fields
	
	var followerCount, followingCount;
	await User.findById(currUserId, async function(err, foundUser) {
		if (err) {
			console.log(err);
			res.redirect("/");
		}
		
		//query who user is following
		var results = await Follower.find(
			{followerName: foundUser.username}
		);
		//populate following array with strings of their names
		const following = [];
		for (var i = 0; i < results.length; i++) {
			console.log(results[i].followeeName);
			following.push(results[i].followeeName);
		}

		//query posts that contain authors or topics in following array
		await Post.find({$or: [{
					author: { $in: following } 
				},
				{
					topic: { $in: following }
				}]
			}).sort( { _id: 1 } ).exec((err, posts) => {
				if (err) {
					console.log(err);
					res.redirect("/");
				}
				if (!posts) {
					console.log('No posts found');
				} else {
					console.log('User posts found: ' + posts.length);
					res.render('timeline2', {user: foundUser, timeline: posts});
				}
			});
	});	

});

app.get('/profile/followers', async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	
	var followerCount, followingCount;
	await User.findById(currUserId, async function(err, foundUser) {
		// get followers, query { followeeName: username }
		await Follower.find({ followerName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followingCount = list.length;
				}
			});

		await Follower.find({ followeeName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followerCount = list.length;
				}
				res.render('followers', {user: foundUser, followers: list, followerCount: followerCount, followingCount: followingCount});
			});
	});
});

app.get('/profile/following', async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;

	var followingCount, followerCount;
	await User.findById(currUserId, async function(err, foundUser) {
		// get following, query { followerName: username }
		if (err) throw err;

		await Follower.find({ followeeName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followerCount = list.length;
				}
			});
			
		await Follower.find({ followerName: foundUser.username })
			.exec((err, list) => {
				if (err) throw err;

				if (!list) {
					console.log('No following found');
				} else {
					console.log('Found list of following');
					followingCount = list.length;
				}
				res.render('following', { user: foundUser, following: list, followerCount: followerCount, followingCount: followingCount });
			});
	});
});

app.get('/profile/savedPosts', async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;

	var followerCount, followingCount;
	await User.findById(currUserId, async function(err, foundUser) {
		// query all posts that are in "saved" array
		if (err) throw err;

		await Follower.find({ followeeName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followerCount = list.length;
				}
			});

		await Follower.find({ followerName: foundUser.username })
			.exec((err, list) =>  {
				if (err) throw err;

				if (!list) {
					console.log('No followers found');
				} else {
					console.log('Found list of followers');
					followingCount = list.length;
				}
				res.render('savedPosts', { user: foundUser, posts: foundUser.savedPosts, followingCount: followingCount, followerCount: followerCount });
			});
	});
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

	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = (decoded.id);

	var currentUsername;
	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) currentUsername = (user.username);
	});
	if (currentUsername == undefined) {
		res.redirect("/topics/" + req.params.topicTitle + "/")
	}
	else {
	var isFollow;
	await Follower.findOne({
		$and: [
			{
				followeeName: req.params.topicTitle
			},
			{
				followerName: currentUsername
			}
		]},
		function(err, result) {
			if (err) console.log("Follower not found");

			if (result) isFollow = true;
			else isFollow = false;
			
		});
	
	await Post.find({ topic: req.params.topicTitle })
        .exec((err, posts) => {
            if (err)  throw err;
            if (!posts) console.log('No posts found!');
            else {
				Topic.find({ })
					.exec((err, result) => {
						res.render('topicsFetch', {topics: result, posts: posts, isFollowing: isFollow});
					});
            }
		});
	}
});

app.get('/settings', users.verifyToken, async function(req, res) {
	// retrieve user info
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	
	await User.findById(currUserId, async function(err, foundUser) {
		if (err) throw err;
		else res.render('settings', {user: foundUser});
	});
});

app.get('/messages', users.verifyToken, async function(req, res) {
	// retrieve user info
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) {
			res.render('messages', {user: user})		
	    }
    });
});

app.get('/messages/:username/', users.verifyToken, async function(req, res) {
	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = decoded.id;
	
	var rcvr = req.params.username;
	var currentUsername;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) {
			currentUsername = (user.username);
			console.log("sent between: "+currentUsername+", "+rcvr);

			Message.find({$or: [{
						sender: currentUsername, 
						receiver : rcvr
					}, 
					{
						sender: rcvr, 
						receiver : currentUsername
					}]
				}).sort( { _id: 1 } ).exec((err, messages) => {
					if (err) throw err;
				    else {
						console.log("Retreived " + messages.length + " messages");
						
						res.render('messagesFetch', {
							user: user, 
							receiver: rcvr, 
							messages: messages});
					}
				});
		}
	});
	
})

app.post('/createMessage', message.create);

app.post('/messages/:username/', message.respond);

app.post('/topics/:topicTitle/follow', follows.handleTopicFollow);
app.post('/topics/:topicTitle/unfollow', follows.handleTopicUnfollow);

app.post('/topics/:topicTitle/:postId/upvote', posts.upvote);
app.post('/topics/:topicTitle/:postId/downvote', posts.downvote);
app.post('/topics/:topicTitle/:postId/save', posts.save);
app.post('/topics/:topicTitle/:postId/comment', posts.comment);

app.post('/signup', users.signup);
app.post('/login', users.login);
app.post('/logout', users.logout);
app.post('/delete', users.delete);

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

app.post('/editProfile', users.editProfile);

app.post('/block', block.handleBlock);

app.post('/unblock', block.handleUnblock);


app.get('/:username', users.verifyToken, async function(req, res) {
	// get selected user's profile

	let token = req.cookies["x-access-token"];
	const decoded = jwt.verify(token, "topical-123456789");  
	var currUserId = (decoded.id);

	var currentUsername;

	//find current user in table
	await User.findById(currUserId, function(err, user) {
		if (err) {
			console.log("User not found");
			res.redirect("/");
		}

		if (user) currentUsername = (user.username);
	});

	if (currentUsername != undefined) {
			
		if (currentUsername == req.params.username) {
			res.redirect('/profile');
		}
		//check if logged in user is following this user
		var isFollow;
		var blocked;

		await Follower.findOne({
			$and: [
				{
					followeeName: req.params.username
				},
				{
					followerName: currentUsername
				}
			]},
			function(err, result) {
				if (err) console.log("Follower not found");

				if (result) isFollow = true;
				else isFollow = false;
				
			});

		await Block.find({$or: [{
				blocker: currentUsername, 
				blockee : req.params.username
			}, 
			{
				blocker: req.params.username, 
				blockee : currentUsername
			}]
		}).exec((err, result) => {
			if (err) {
				console.log(err);
				res.redirect("/");
			}
			else {
				if (result && result != "") blocked = true;
				else blocked = false;

				User.findOne({username: req.params.username}, function(err, foundUser) {
					if (err) {
						console.log(err);
						res.redirect("/");
					}
					console.log("result:" + result);
					console.log("isblocked2: " + blocked);
					res.render('user', {
						user: foundUser,
						isFollowing: isFollow, 
						isBlocked: blocked});
				});
			}
		});
	} else res.redirect("/" + req.params.username);
});

app.post('/handleFollow', follows.handleUserFollow);

app.post('/handleUnfollow', follows.handleUserUnfollow);

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});