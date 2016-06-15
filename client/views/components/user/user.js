var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._; //Underscore must already be loaded on the page
});

angular.module('savor.user',['ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'underscore', 'savor.friends'])

.controller('userCtrl', function($scope, $http, _, Meals, masonryGrid) {
  $scope.gridLoaded = false;

  console.log('user controller loaded');

  $scope.$on('ngRepeatFinished', function (element, test, test2) {
    if (!$scope.gridLoaded) {
      console.log('first ngrepeat finished');
      masonryGrid.instantiateMasonryGrid();
      $scope.gridLoaded = true;
    } else {
      console.log('new item update ngrepeat finished');
      masonryGrid.updateMasonryGrid(test);
      // .masonry( 'appended', elem )
      // masonryGrid.updateMasonryGrid();
    }
    console.log(test);
  });

  angular.extend($scope, Meals);

  $scope.profile = JSON.parse(localStorage.getItem('profile'));
  
  // Set to false at first so that we only get the current user's friends
  // not friends of friends
  var friendsChecked = false;

  function getAll(id, friendTag) {
    $http.get('/api/users/' + id).then(function(res) {
      var mealsList = res.data.meals;

      // Adds a tag to our friends' meal options so that we can pull their nickname
      if (friendTag) {
        mealsList.forEach(function(currentMeal) {
          currentMeal.friendTag = friendTag;
        });
      }
      
      Meals.updateMeals(mealsList);
      // masonryGrid.updateMasonryGrid();

      // console.log(Meals.meals);
      
      // We only want to check the friends of the current user
      if (!friendsChecked) {
        friendsChecked = true;
        // checkFriends(res.data.friends);
      } 
    });
  }
  
  getAll($scope.userOnRootScope.user_id);
  
  var checkFriends = function(friendArray) {
    friendArray.forEach(function(currentFriend) {
      getAll(currentFriend.userID, currentFriend.userAvatar);
    });
  };
  
  $scope.getTileCardAvatar = function(meal) {
    if (meal.friendTag) {
      return meal.friendTag;
    } else {
      return $scope.userOnRootScope.picture;
    }
  };
})

.factory('Meals', function() {
  var meals = [];
  var mealOptions = [];

  var addMeal = function(newMeal){
    meals.push(newMeal);
  };
  
  var updateMeals = function(array) {
    array.forEach(function(meal) {
      meals.push(meal);
    });
    
    // mealOptions.forEach(function(currentValue) {
    //   currentValue.forEach(function(currentMeal) {
    //     console.log('meals ', meals);
    //     console.log('currentMeal ', currentMeal);
    //     meals.push(currentMeal);
    //   });
    // });
  };

  return {
    meals: meals,
    mealOptions: mealOptions,
    addMeal: addMeal,
    updateMeals: updateMeals
  };
})

.directive('onFinishRender', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last) {
                $rootScope.$broadcast("ngRepeatFinished", element, scope, attr);
            }
        }
    };
})


// Not being used
.directive("ngRandomClass", function () {
  return function(scope, element) {
    // Random classes for assigning different sizes to grid items
    var classes = [
      'grid-item--height1 grid-item--width1',
      'grid-item--height2 grid-item--width2',
      'grid-item--height3 grid-item--width3',
      'grid-item--height4 grid-item--width4'
    ];

    // Currently, 70% chance a grid item will be assigned another class to change its size
    if (Math.random() > 0.3) {
      // Assign a random class size to the current ng-repeat grid-item
      $(element).addClass(classes[Math.floor(Math.random() * classes.length)]);
    }
  }
})

.factory('masonryGrid', function() {
  var $grid = null;

  // Assign masonry grid functionality
  var instantiateMasonryGrid = function() {
    $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      columnWidth: 250
    });

    // Attach event listener to the grid items in order to toggle its size
    $grid.on( 'click', '.grid-item', function() {
      $( this ).toggleClass('grid-item--gigante');
      // Force masonry to refresh the grid and reflect updated layout
      $grid.masonry();
    });
  }

  var updateMasonryGrid = function(elem) {
    $grid.masonry('reloadItems');
    $grid.masonry();
  }

  return {
    instantiateMasonryGrid: instantiateMasonryGrid,
    updateMasonryGrid: updateMasonryGrid
  };
});