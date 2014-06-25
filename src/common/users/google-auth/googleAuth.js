angular.module( 'users.googleAuth',['users.config'])
.factory('GoogleAuth', ['$q','$http',function($q,$http){ 
  var googleAuth={}

  googleAuth.signOut=function() {
    gapi.auth.signOut();
    GoogleAuth.revoke(function(r) {
      console.log('Revoking');
    })
  };
  
  googleAuth.revoke=function() {
    if (typeof gapi=='undefined' || gapi.auth.getToken()==null) {
      return null;
    }
    var url= 'https://accounts.google.com/o/oauth2/revoke?token=' +token.access_token;
    return $http({method: 'GET', url:url});
  };
  
  googleAuth.userInfo=function() {
    var deferred=$q.defer();
    if (!gapi.auth.getToken()) {
        deferred.reject("User not logged in");      
    }
    else {
      gapi.client.load('plus','v1', function(){ 
        var request = gapi.client.plus.people.get({'userId': 'me'});
        request.execute(function (resp) { deferred.resolve(resp); } );
      });
    }
    return deferred.promise;
  };

  return googleAuth;
}])

.directive('googleSignIn',function(GOOGLE_SIGNIN_CLIENT_ID) {
    return {
        restrict:'A',
        link: function (scope, element) {
            var googlePlusOneLoaded=false;
            var scripts=document.getElementsByTagName('script');            
            for (var i=0; i  < scripts.length;i++) {
                if (scripts[i].src.indexOf("apis.google.com/js/client:plusone") > 0) {
                    googlePlusOneLoaded=true;
                    console.log("Google plus already loaded!");
                    break;
                }
            }
            if (!googlePlusOneLoaded) {
                console.log("Load in google plus one script");
                var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
                po.src = 'https://apis.google.com/js/client:plusone.js?onload=googleOnLoadCallBack';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);  
            }
            element[0].className=element[0].className + ' googleSignIn';  
            element[0].setAttribute("clientid",GOOGLE_SIGNIN_CLIENT_ID);
            if (googlePlusOneLoaded) {
              window.setTimeout(googleOnLoadCallBack(),100);
            }
        }
        //templateUrl:"users/googleAuth/google.tpl.html"
    };
});

function googleOnLoadCallBack() {
  var signInButtons=document.getElementsByClassName("googleSignIn");
  for (var i=0; i < signInButtons.length;i++) {
    var s=signInButtons[0];
    var clientid=s.getAttribute("clientid");
    gapi.signin.render(signInButtons[i], {
      'callback': 'googleSignInCallback',
      'clientid': clientid,
      'cookiepolicy': 'single_host_origin',
      'requestvisibleactions': 'http://schemas.google.com/AddActivity',
      'scope': 'https://www.googleapis.com/auth/plus.login'
    });
  }
}


//http://wheresgus.com/signindemo/
function googleSignInCallback(authResult) {
  var elm=document.getElementsByClassName('googleSignIn');
  if (elm && elm.length > 0) {
    var a=elm[0]
    angular.element(a).scope().googleCallback(authResult);
  }
  else {
    console.log("Can't find controller on google callback.");
  }
}


/*
  + Kill the username (or at least do not require it.)
  + users.js controller must set a user_id.  Google p

   AuthResult, if logging in:
     get user id
     search database for that user_id
     if find that id: 
        user already exists, go ahead and show
      else find that id:
         user doesn't exist... now need to create the user and then prompt him for a username.
*/




