angular.module( 'tonetime.users.config',[])
/*
  A component has one more more interfaces that typically need to be implemented
  to fit the application.  See the UserInterface class in interface.js
*/
.factory('UserFactory', ['$q','$rootScope',function($q,$rootScope){
    //return new TestUserInterface($q);
    //return new PouchDBUserInterface($q,null);
    return new ParseUsers($q,$rootScope);
}])

/* Only needed if you want to google signin
For getting a client id see:
https://developers.google.com/+/web/signin/add-button
*/
.constant("GOOGLE_SIGNIN_CLIENT_ID","358090738433-a3ktobavvbabt5jbud8ila3976h5761p.apps.googleusercontent.com")
.constant("FACEBOOK_APP_ID", "231373717062458")

