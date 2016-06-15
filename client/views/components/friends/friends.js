angular.module('savor.friends',[
  'ngMaterial',
  'ngMessages',
  'material.svgAssetsCache',
  'ngDialog',
  'savor.user'])
.controller('friendsController', function($scope, Meals, $rootScope, $http, ngDialog, Upload, $window, Reviews, Meals) {
  
  var friendList = [];
  var getAllUsers = function() {
    $http({
      method: "GET",
      url: '/api/users/'
    }).then(function(response) {
      // response.data is an array of all the users
      // each user object we want to pull .username from
      // an array of all of our user data
      var users = response.data;
      users.forEach(function(currentUser) {
        var user = {
          username: currentUser.username,
          userID: currentUser.userID,
          userAvatar: currentUser.userAvatar
        };
        
        if (user.userID !== $scope.userOnRootScope.user_id) {
          friendList.push(user);
        }
      });
    });
  };
  getAllUsers();

$scope.userList = friendList;

  $scope.addFriendToUser = function(friend) {
    var data = {
      userID: $scope.userOnRootScope.user_id,
      friend: friend
    };
    $http({
      method: "GET",
      url: '/api/users/' + friend.userID,
      data: friend
    }).then(function(res) {
      var user = res.data;
      // console.log('the user ', user);
      user.meals.forEach(function(meal) {
        // ****** TODO ADD FRIEND TAG ********
        meal.friendTag = user.userAvatar;
        // console.log($scope.meals);
        // console.log(Meals.meals);
        console.log('the meal ', meal);
        Meals.meals.push(meal);
      });
    });
    
    $http({
      method: "POST",
      url: '/api/users/friends/',
      data: data
    });
  };

});
