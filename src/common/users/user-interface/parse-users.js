function ParseUsers($q,$rootScope,ParseObject) {
	if (typeof Parse === "undefined") {
		alert("Parse Library is not Loaded! Can't handle user functions.")
	}	
	this.IamUserInterface=true;
	this.oauthProvider=null;
	this.user=function() {
		return Parse.User.current();
	};
	this.getUsername=function() {
		var u=this.user();		
		return u? u.get("username") : null;
	};
	this.authorized=function(role) {
		if (role=='user' && this.user()==null) {
			return false;
		}
		else {
			return true;
		}
	};
	this.signedIn=function() {
		return this.user() != null;
	};

	this.facebookSignin=function() {
		var deferred = $q.defer();
		Parse.FacebookUtils.logIn(null, {
		  success: function(user) {
		    if (!user.existed()) {
		    	FB.api('/me', function(response) {
		    		user.set('username',response.name);
		    		if (response.email) {
		    			user.set('email',response.email);
		    		}
		    		user.save(null, {
		    			success:function(user) {
		    				deferred.resolve(user);
		    				$rootScope.$broadcast("oauthSignin", user);
		    			},
		    			error:function(user,error) {
		    				$rootScope.$broadcast("oauthError", error);
		    				deferred.reject(error);
		    			}
		    		})
		    	});
		    } else {
		    	console.log("User already logged in.");
		    	$rootScope.$broadcast("oauthSignin", user);
		    	deferred.resolve(user)
		    }
		  },
		  error: function(user, error) {
		  	console.log(user);
		  	$rootScope.$broadcast("oauthError", "Could not sign in to facebook.");
		  	deferred.reject(error.message);
		  }
		});
		return deferred.promise;
	};

	this.signin=function(id,password,remember_me) {
		var deferred = $q.defer();
		Parse.User.logIn(id, password, {
			success:function(user) {
				deferred.resolve(user);
			},
			error:function(user,error) {
				deferred.reject("Invalid Login Parameters");
				console.log('but not here am i right?');
			}
		});
		return deferred.promise;
	};	
	this.signout=function() {
		var deferred=$q.defer();
		Parse.User.logOut();
		deferred.resolve("Signed out");
		return deferred.promise;
	};	
	this.requestPasswordReset=function(email) {
		var deferred=$q.defer();
		Parse.User.requestPasswordReset(email, {
		  success: function(e) {
		  	deferred.resolve("Password Reset Instructions Sent");
		  },
		  error: function(error) {
		  	deferred.reject(error.message);
		  }
		});
		return deferred.promise;
	};	
    this.changePassword=function(oldpassword,newpassword) {
        var deferred=$q.defer();        
        var user=this.user();
        user.set("password",newpassword);
        user.save()
        .then(
            function(user) {
                deferred.resolve(user);
                console.log('Password changed', user);
            },
            function(error) {
                deferred.reject(error);
                console.log('Something went wrong', error);
            }
        );
        return deferred.promise;
    }
    
	this.signup=function(dict) {
		var deferred = $q.defer();
		var user = new Parse.User();
		user.set("username", dict.username);
		user.set("password", dict.password);
		user.set("email", dict.email);
		user.signUp(null, {
			success:function(user) {
				deferred.resolve(user);				
			},
			error:function(user,error) {
				deferred.reject(error.message);
			}
		});
		return deferred.promise;
	};

	this.isEmailAddressTaken=function(email) {
		return this.getUser('email',email);
	};	
	this.isUserIDTaken=function(username){
		return this.getUser('username',username);
	};
	this.getUser=function(key,value) {
		var deferred = $q.defer();
		var query = new Parse.Query(Parse.User);
		query.equalTo(key, value); 
		query.find({
		  success: function(user) {
		  	deferred.resolve(user);
		  	//deferred.resolve(user.length!=0);
		  },
		  error:function(user,error) {
		  	console.log(error);
		  	deferred.reject(false);
		  }
		});		
		return deferred.promise;
	};
}