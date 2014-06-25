angular.module( 'tonetime.users', [
    'ui.router',
    'tonetime.users.config',
    'tonetime.users.directives',
    'tonetime.users.facebookAuth',
    'tonetime.users.parseServices'
])


.run(function ($rootScope,$state,UserFactory) {
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (toState.data.role && !UserFactory.authorized(toState.data.role)) {
                event.preventDefault();
                $rootScope.$broadcast("userUnauthorized",toState.url,"You must sign in to access this!");
            }
        });
    
        $rootScope.$on("userUnauthorized", function(event,toUrl,message) {
            $rootScope.flash=message;
            sessionStorage.setItem("return_to",toUrl);
            $state.go("signin",{},{reload:true});           
        });
    
        $rootScope.$on('userSignout',function(e,f) {
            //if i am in a protected page i need to go away.
            if ($state.$current.data.role && UserFactory.authorized($state.$current.data.role)===false) {
                $rootScope.flash='You were signed out.';
                $state.go("signin",{},{reload:true});
            }
        })
})

.config(function config( $stateProvider ) {
        $stateProvider.state('users', {
            url: '/users',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/users.tpl.html'
                }
            },
            data:{ pageTitle: 'Users' }
        });
        $stateProvider.state('signin', {
             url: '/signin',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/signin.tpl.html'
                }
            },
            data:{ pageTitle: 'Sign In' }

        });
        $stateProvider.state('signup', {
            url: '/signup',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/signup.tpl.html'
                }
            },
            data:{ pageTitle: 'Signup' }
        });
        $stateProvider.state('signout', {
            url: '/signout',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/signout.tpl.html'
                }
            },
            data:{ pageTitle: 'Sign Out' }
        });
        $stateProvider.state('forgot', {
            url: '/forgot',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/forgot.tpl.html'
                }
            },
            data:{ pageTitle: 'Forgot Password' }
        });
    
        $stateProvider.state('change_password', {
            url: '/change_password',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/change-password.tpl.html'
                }
            },
            data:{ role: "user", pageTitle: 'Change Password' }
        });       

        $stateProvider.state('myaccount', {
            url: '/myaccount',
            views: {
                "main": {
                    controller: 'UsersController',
                    templateUrl: 'users/myaccount.tpl.html'
                }
            },
            data: {
                      role: "user",
                      pageTitle: "My Account"
            }
        });
})

.controller('UsersController', function ($scope,$rootScope,$location,UserFactory,ParseObject) {

        var user_state_change=function(redirect) {
            $rootScope.$broadcast("userChange", "");
            if (redirect) {
              var return_to=sessionStorage.getItem("return_to");
              sessionStorage.removeItem("return_to");
              $location.path(return_to ? return_to : "/");              
            }
        };

        var init = function() {                        
            if (sessionStorage.getItem("return_to")==null) {            
                sessionStorage.setItem("return_to", $location.search().return_to);      
            }
            if ($location.path()=='/signout') {
                UserFactory.signout();
                user_state_change(false);
            } 
            if ($rootScope.flash) {
                $scope.message=$scope.flash;
                $rootScope.flash=null;
            }
            else {
                $scope.message=null;
            }
            $scope.user= new ParseObject(UserFactory.user(),['username','email','password','about']);
        };
        init();

        $scope.authenticate=function(promise) {
            promise.then(function(user) {
                console.log('User has been authenticated');
                user_state_change(true);
            },
            function(error_message) {
                console.log("Authentication failed!");
                $scope.message=error_message;
            }
            );
        }
        
        $scope.updateUserInfo=function(isValid) {
            $scope.user.save().then(function(success) {
                $scope.message='User Saved';                
            },function(error) {
                $scope.message=error.message
            });
        }
        
        $scope.changePass=function(isValid) {
            if ($scope.newpassword1 !== $scope.newpassword2) {
                $scope.message='New passwords do not match';
            }
            else {
                $scope.message='';
                var promise=UserFactory.changePassword($scope.oldpassword,$scope.newpassword)
                promise.then(function(user) {
                    $scope.message='Password updated';
                },function(error ) {
                   $scope.message=error.message; 
                });
                
            }
        }
        
        $scope.signin = function(isValid) {            
            $scope.message=null; 
            var promise=UserFactory.signin($scope.user.username,$scope.user.password);
            $scope.authenticate(promise);
        };
        $scope.signup=function() {        
            $scope.message=null;   
            var promise=UserFactory.signup($scope.user);
            $scope.authenticate(promise);
        };
        $scope.signout=function() {
            UserFactory.signout();
            user_state_change(false);
            $rootScope.$broadcast("userSignout", "");

        }
        $scope.forgot=function() {
            $scope.message=null;
            var promise=UserFactory.requestPasswordReset($scope.user.email);
            promise.then(
                function(ok) {
                    $scope.passwordResetSent=true;
                },
                function(error_message) {
                    $scope.message=error_message;
                    $scope.user.email=null;
                }
            );
        };

        $scope.$on('oauthSignin', function(promise) {
            user_state_change(true);
            $scope.$apply();
        });
        $scope.$on('oauthError', function(event,error) {
            $scope.message=error;
            $scope.$apply();
        });

});

