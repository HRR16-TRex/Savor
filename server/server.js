//Set up express.
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var cors = require('cors');
var morgan = require('morgan');
var multer = require('multer');
var bodyParser = require('body-parser');
var userController = require('./db/controllers/userController.js');

// var authEnvironment = require('./authEnvironment.js');

var port = process.env.PORT || 4000;

// Set up mongoose
var mongoose = require('mongoose');
mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/restaurant';
mongoose.connect(mongoURI);

// Verify mongoose connection.
var db = mongoose.connection;
db.on('error', console.error.bind(console, "There's an error"));
db.once('open', function callback(){console.log('successfully logged into mongo');  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/../client'));
app.use(morgan('dev'));
app.use(cors());

var authCheck = jwt({
  secret: new Buffer(process.env.AuthO_Secret + '', 'base64'),
  // audience is clientID
  audience: 'soUXI6OjMIep7IS2mPUgCxIrLgQF96Hy'
});

//stores the photo in the uploads directory.
var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/');
  },
  filename: function(req, file, cb){
    var fileNameGiven = cb(null, file.originalname);
  }
});

// load in aws functionality
var AWS = require('aws-sdk');

// environment variables are defined in heroku
var S3_BUCKET = process.env.S3_BUCKET;

// handles uploading and returning of image
app.get('/sign-s3', function(req, res) {
  var s3 = new AWS.S3();
  var fileName = req.query['file-name'];
  var fileType = req.query['file-type'];
  var s3Params = { Bucket: S3_BUCKET, Key: fileName, Expires: 60, ContentType: fileType, ACL: 'public-read' };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    var returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });
});


var upload = multer({storage: storage}).single('file');

// // use this route with review submit button
// app.post('/api/restaurants', handler.addRestaurant);

// app.get('/api/private', handler.getRestaurantsByUser);

// app.get('/api/public', function(req, res) {
//   res.json({ message: "Hello from a public endpoint! You don't need to be authenticated to see this." });
// });

// app.get('/api/private', authCheck, function(req, res) {
//   res.json({ message: "Hello from a private endpoint! You DO need to be authenticated to see this." });
// });


// User Routes
// Get all users, useful for testing mostly
app.get('/api/users/', function(req,res) {
  userController.getAll(function(users) {
    res.status(200).json(users);
  });
});

// Get one specific user's information
app.get('/api/users/:id', function(req, res) {
  var id = req.params.id;
  userController.getUser(id, function(user) {
    res.status(200).json(user);
  });
});

// For logging in, will either create a user or just return the found user
app.post('/api/users/', function(req, res) {
  var id = req.body.userID;
  var username = req.body.username;
  var userAvatar = req.body.userAvatar;
  userController.checkOrCreateUser(id, username, userAvatar, function(user) {
    res.status(201).send(user);
  });
});

// Add a meal to a user
app.post('/api/users/meals/', function(req, res) {
  var mealObject = req.body;
  userController.addMealToUser(mealObject, function() {
    res.status(201).send("Meal added to user");
  });
});

// Add a friend to a user
app.post('/api/users/friends/', function(req, res) {
  var id = req.body.userID;
  var friend = req.body.friend;
  userController.addFriendToUser(id, friend, function() {
    res.status(201).send("Friend added to user");
  });
});

//photo upload
app.post('/uploads', function(req, res) {
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
         res.json({error_code:0,err_desc:null});
    });
});

app.use('/uploads', express.static(__dirname + '/uploads'));

// Start server
var port = process.env.PORT || 4000;
app.listen(port);
console.log('Listening at port: ' + port);









// //exposes the id from mongodb to an API.
// app.get('/api/restaurant/:id', function(req, res){
//   Restaurant.findById(req.params.id, function(err, data){
//     res.json(data);
//   });
// });

// app.delete('/api/restaurant/:id', function(req, res){
//   Restaurant.remove({_id: req.params.id}, function(err, doc){
//     console.log(err);
//     console.log(doc);
//     Restaurant.findById(req.params.id, function(err, data){
//       res.json(data);
//     });
//   });
// });
