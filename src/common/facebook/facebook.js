angular.module( 'tonetime.facebook', [
  'ui.router'
])
.factory('Facebook', ['$q',function($q){ 
	var facebook={}
	facebook.loadSDKV1=function(FACEBOOK_APP_ID) {
		var facebookSDKLoaded=false;
		var scripts=document.getElementsByTagName('script');            
		for (var i=0; i  < scripts.length;i++) {
		    if (scripts[i].src.indexOf("connect.facebook.net/en_US/all.js") > 0) {
		        facebookSDKLoaded=true;
		        console.log("Facebook SDK already loaded!");
		        break;
		    }
		}
		if (facebookSDKLoaded===false) {
			(function(d, s, id){
			   var js, fjs = d.getElementsByTagName(s)[0];
			   if (d.getElementById(id)) {return;}
			   js = d.createElement(s); js.id = id;
			   js.src = "//connect.facebook.net/en_US/all.js";
			   fjs.parentNode.insertBefore(js, fjs);
			 }(document, 'script', 'facebook-jssdk'));
		}
	};


	facebook.loadSDKV2=function(FACEBOOK_APP_ID) {
		
	}
	return facebook;
}]);