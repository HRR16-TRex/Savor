angular
    .module('savor.toolbar', [])// we need to sort this out
    .controller('toolbarController', toolbarController);

function toolbarController(auth, store, $location, ngDialog, $scope, $rootScope, $mdDialog) {
    var vm = this;
    vm.logout = logout;
    vm.auth = auth;
    
    function logout() {
      console.log("Logout Success");
      // The signout method on the auth service
      // sets isAuthenticated to false but we
      // also need to remove the profile and
      // token from local storage
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $rootScope.isUserReallyAuthenticated = vm.auth.isAuthenticated;
      $location.path('/');
      if (!$rootScope.$$phase) $rootScope.$apply();
    }

    $scope.openReview = function() {
      ngDialog.open({template: '/views/components/review/review.html',
        controller: 'reviewCtrl',
        scope: $scope,
        className: 'ngdialog-theme-default dialogwidth800'
      });
    };
    
    // For opening to friends section
    $scope.openFriendsList = function() {
      ngDialog.open({template: '/views/components/friends/friends.html',
        controller: 'friendsController',
        scope: $scope,
        className: 'ngdialog-theme-default dialogwidth800'
      });
    };
}
