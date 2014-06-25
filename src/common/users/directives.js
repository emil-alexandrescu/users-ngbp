angular.module( 'tonetime.users.directives',[])
//https://medium.com/@sammla_/angularjs-a-unique-validation-48d9e823e17e
.directive('uniqueUsername', function($timeout,UserFactory) {
 return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
       var stop_timeout;
       return scope.$watch(function() {
          return ngModel.$modelValue;
       }, function(name) {
          $timeout.cancel(stop_timeout);

          if (!name || (name && name.length < 4)) {
            ngModel.$setValidity('uniqueUsername', true); 
            return;
          } 

          if (name === '') {
             ngModel.$setValidity('uniqueUsername', true); 
          }
          stop_timeout = $timeout(function() {
                var promise=UserFactory.isUserIDTaken(name);
                promise.then(
                    function(result) {
                        ngModel.$setValidity('uniqueUsername', result.length < 1);       
                    }
                )
          }, 200);
       });
       }
    };
})

.directive('uniqueEmail', function($timeout,UserFactory) {
 return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
       var stop_timeout;
       return scope.$watch(function() {
          return ngModel.$modelValue;
       }, function(name) {
          $timeout.cancel(stop_timeout);

          if (!name || (name && name.length < 4)) {
            ngModel.$setValidity('uniqueEmail', true); 
            return;
          } 
          if (name === '')  {
             ngModel.$setValidity('uniqueEmail', true); 
             return;
         }
          stop_timeout = $timeout(function() {
                var promise=UserFactory.isEmailAddressTaken(name);
                promise.then(
                    function(result) {
                        ngModel.$setValidity('uniqueEmail', result.length < 1);       
                    }
                )
          }, 200);
       });
       }
    };
})
.directive('usersWelcome', function(UserFactory) {
    return {
      restrict: 'E',
      link: function (scope, element) {
        var f=function(scope) {
            scope.signed_in=UserFactory.signedIn();
            scope.username=UserFactory.getUsername();
            if (scope.username) {
                scope.username=scope.username.charAt(0).toUpperCase() + scope.username.slice(1);            
            }
        }
        scope.$on('userChange', function(e) {
            f(scope);
        });
        f(scope);         
      },
      templateUrl:"users/signin-welcome.tpl.html"
    };
});






