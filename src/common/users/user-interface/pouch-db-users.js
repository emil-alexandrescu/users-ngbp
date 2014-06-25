function PouchDbUsers($q,url) {
	if (typeof PouchDB === "undefined") {
		alert("PouchDB Library is not Loaded! Can't handle user functions.")
	}	
	var source=url ? url : 'users';
	console.log("Source DB is " + source);
	this.db=new PouchDB( source);
	this.IamUserInterface=true;
	this.user=function() {
		return null;
	};
	this.getUsername=function() {
		return null;
	};
	this.signedIn=function() {
		return false;
	};
	this.signup=function(dict) {
		var deferred = $q.defer();
		var copy=angular.copy(dict,null);
		var username=copy.username.toLowerCase();
		copy['_id']=username;
		copy.sessionId=this.createSessionId();
		delete copy['username'];
		var p=this.isUserIDTaken(username);	
		var dbb=this.db;  //ug scope
		p.then(function(userTaken) {
			if (!userTaken) {
				dbb.put(copy).then(function(err,response) {
					if (err) {
						deferred.reject(err);
					}
					else {
						deferred.resolve(response);
					}
				});
			}
			else {
				deferred.reject("User already taken!");
			}
		},
		function(err) {
			console.log('but not at err!');
		}
		);
		return deferred.promise;
	}
	this.isEmailAddressTaken=function(email) {
		return null;
	};	
	this.isUserIDTaken=function(username){
		var deferred = $q.defer();
		this.db.get(username, function(err,response) {
			if (err) {
				console.log('go to error '+err);
				deferred.resolve(false);
			}
			else {
				console.log("now here? " + response);
				deferred.resolve(true);
			}
		})
		return deferred.promise;
	};
	this.getUser=function(username) {
		db.get(username).then(function(z) { X=z } )
	};
	this.createSessionId=function() {
		return Math.random().toString(36).slice(2);
	};


}