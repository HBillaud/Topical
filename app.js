const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

var app = express();

// Including all controllers
var users = require('./controllers/users_controller');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.set('views', __dirname + "/views");

// set the view engine to ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/assets'));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/controllers'));

// set the home page route
app.get('/', function(req, res) {
		res.render('index');
});

app.get('/signup', function(req, res) {
	res.render('signup');
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/profile', function(req, res) {
	res.render('profile');
});

app.get('/logout', function(req, res) {
	res.redirect('/login');
});

app.get('/topics', function(req, res) {
	res.render('topics');
});

app.get('/settings', function(req, res) {
	res.render('settings');
});

app.post('/signup', users.signup);
app.post('/login', users.login);

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});