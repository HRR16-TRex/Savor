var User = require('../models/users.js');
var _ = require('underscore');

module.exports = {
  // Largely a testing function to see all users in the db
  getAll: function(callback) {
    User.find({}).exec(function(err, users) {
      callback(users);
    });
  },
  
  getUser: function(id, callback) {
    User.findOne({userID: id}).exec(function(err, foundUser) {
      if (foundUser) {
        console.log('Found the user');
        callback(foundUser);
      } else {
        console.log('User not found');
      }
    });
  },
  
  // We will use this with a post so we can have the 
  // necessary information to create a user
  checkOrCreateUser: function(id, username, userAvatar, callback) {
    User.findOne({userID: id}).exec(function(err, foundUser) {
      if (foundUser) {
        console.log('Found the user');
        callback(foundUser);
      } else {
        console.log('User not found, creating user');
        var newUser = {
          userID: id,
          username: username,
          userAvatar: userAvatar
        };
        User.create(newUser);
        callback(newUser);
      }
    });
  },
  
  addMealToUser: function(mealObject, callback) {
    var id = mealObject.userID;
    User.update({userID: id}, {$addToSet: {"meals": mealObject}}, function(err, foundUser) {
      if (foundUser) {
        callback(foundUser);
      } else {
        console.log('There was an error');
        callback(foundUser);
      }
    });
    
  },
  
  addFriendToUser: function(id, friend, callback) {
    User.update({userID: id}, {$addToSet: {"friends": friend}}, function(err, foundUser) {
      if (foundUser) {
        callback(foundUser);
      } else {
        console.log('There was an error');
        callback(foundUser);
      }
    });
   }
};