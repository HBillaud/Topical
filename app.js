const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const mongoClient = require('mongodb').MongoClient;
const objectID = require('mongodb').ObjectID;
const CONNECTION_URL = "mongodb+srv://HBillaud:Floride09@cluster.oye5v.mongodb.net/admin?retryWrites=true&w=majority";
const DATABASE_NAME = "local";

var app = express();

// create instance of MongoClient
const client = new mongoClient(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true });

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

    // ejs render automatically looks in the views folder
    res.render('index.html');
});

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

// establishing connection to database
try {
	// connect to the MongoDB cluster
	client.connect(err => {
		const collection = client.db(DATABASE_NAME).collection("people");
		// perform actions on the collection object
		console.log("Connected to '" + DATABASE_NAME + "'!");
		client.close();
	  });

} catch (e) {
	console.error(e);
}