angular
    .module('savor.login', [])
    .controller('loginController', loginController);

function loginController(auth, store, $location, ngDialog, $scope) {
    var vm = this;
    vm.login = login;
    vm.logout = logout;
    vm.auth = auth;
    
    function login() {
      console.log("Login Success");
      // The auth service has a signin method that
      // makes use of Auth0Lock. If authentication
      // is successful, the user's profile and token
      // are saved in local storage with the store service
      auth.signin({}, function(profile, token) {
        store.set('profile', profile);
        store.set('token', token);
        $location.path('/user');
        if (!$rootScope.$$phase) $rootScope.$apply();
      }, function(error) {
        console.log(error);
      });
    }

    function logout() {
      console.log("Logout Success")
      // The signout method on the auth service
      // sets isAuthenticated to false but we
      // also need to remove the profile and
      // token from local storage
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $location.path('/');
      if (!$rootScope.$$phase) $rootScope.$apply();
    }

    $scope.openReview = function() {
      ngDialog.open({template: '/views/components/review/review.tpl.html',
        controller: 'reviewController',
        scope: $scope,
        className: 'ngdialog-theme-default dialogwidth800'
      })
    }
}
