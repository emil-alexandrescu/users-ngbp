angular.module( 'tonetime.users.facebookAuth',['tonetime.facebook','tonetime.users.config'])

.directive('parseFacebookSignin',function(UserFactory,Facebook,FACEBOOK_APP_ID) {
	return {
		restrict:'A',
		link:function(scope,element) {
			Facebook.loadSDKV1(FACEBOOK_APP_ID);
			if (typeof window.fbAsyncInit =='undefined') {
				window.fbAsyncInit = function() {
					console.log(FACEBOOK_APP_ID);
					Parse.FacebookUtils.init({
						appId:FACEBOOK_APP_ID,
						channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
						cookie     : true, // enable cookies to allow Parse to access the session
						xfbml      : true  // parse XFBML
					});
				};
			}

			element.bind('click',function() {
				UserFactory.facebookSignin();
			})
		}
	}
})
