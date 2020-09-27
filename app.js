const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const realm = require('realm');

var app = express();

const appId = "topical-gleqy";
const appConfig = {
	id: appId,
	timeout: 10000,
};
const realmApp = new realm.App(appConfig);

var users = require('./controllers/users_controller');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

app.set('views', __dirname + "/views");

// set the view engine to ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {
	if (realmApp.currentUser) {
		res.render('index.html')
	} else {
		res.render('registration.html');
	}
});

app.post('/', users.signup);

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});