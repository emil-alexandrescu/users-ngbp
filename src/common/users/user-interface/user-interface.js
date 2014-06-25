
/*
This is the interace.
*/
function UserInterface($q) {
	this.IamUserInterface=true;
	this.signedIn=function(){}; //return boolean if the user is logged in. 
	/* All functions return a $q promise! */	
	this.getCurrentUser=function(){};  
	this.authorized=function(role) {};  /* Is current user authorized for given role? return true/false */
	this.oauthSignin=function(user_id,oauth_provider) {};   /* required only when using oauth provider like facebook/google */
	this.signin=function(user_id,password,remember_me) {};	
	this.signup=function(user_id,user_data,oauth_provider) {};	/* oauth provider can be null */
	this.signout=function() {};	
	this.requestPasswordReset=function(user_id) {};	
	this.isEmailAddressTaken=function(email) {};	
	this.authenticationToken=function() {};   /* returns an authentication token to call to data store */
	this.isUserIDTaken=function(user_id){};
	this.updateUser=function(user_id,user_data){};
}


/* Dummy user interface implementing the UserInterface type */
function TestUsers($q) {
	this.IamUserInterface=true;
	this.user=null;
	this.signedIn=function() {
		return this.user!=null;
	};
	this.authorized=function(role) {
		if (role=='user') {
			return this.user!=null;
		}
		else {
			return true;
		}
	}
	this.getUsername=function() {
		return this.user ? this.user['id'] : null;
	};
	this.signin=function(id,password,remember_me) {
		this.user=null;
		var deferred = $q.defer();	
		if (id=='fail@fail.com') {			
			deferred.reject("Could not sign in.")
		}
		else {
			this.user={'id':'george'};
			deferred.resolve(this.user)
		}
		return deferred.promise;
	};
	//signup must return a promise;
	this.signup=function(dict) {		
		var deferred=$q.defer();	
		if (dict && dict.username=='fail') {			
			deferred.reject("Could not sign up");
		}	
		else {
			deferred.resolve(dict);
			this.user=dict;
		}
		return deferred.promise;
	};
	//sign out must return a promise
	this.signout=function() {
		var deferred=$q.defer();	
		this.user=null;
		deferred.resolve("Signed Out");
		return deferred.promise;
	};
	this.requestPasswordReset=function(id) {
		var deferred=$q.defer();
		if (id=='fail@fail.com') {
			deferred.reject("Could not reset password")
		}
		else {
			deferred.resolve(true)
		}
		return deferred.promise;
	};
	this.isEmailAddressTaken=function(email) {
		var deferred=$q.defer();
		deferred.resolve(email=='foo@bar.com');
		return deferred.promise;
	};
	this.isUserIDTakenTaken=function(username) {
		var deferred=$q.defer();
		deferred.resolve(username=='user123');
		return deferred.promise;
	};
}



