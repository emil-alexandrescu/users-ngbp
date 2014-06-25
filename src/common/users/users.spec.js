describe('users section', function () {
    var scope;
    var userFactory;

    beforeEach(module('tonetime.users'));
    beforeEach(angular.mock.inject(function($rootScope, $controller,UserFactory){
        //create an empty scope
        scope = $rootScope.$new();
        scope.user={};
        userFactory=UserFactory;
//        scope.user.username='george';
//        scope.user.password='foobar';
        
        //declare the controller and inject our empty scope
        $controller('UsersController', {$scope: scope});
    }));

    
    it('just a test', function(UserFactory) {
//        var result=scope.signin(false);
//        console.log(result);
//        console.log(UserFactory);
//        debugger;  
    });
    
    it('should have a dummy test', inject(function() {

        expect(true).toBeTruthy();        
    }));
    
});

