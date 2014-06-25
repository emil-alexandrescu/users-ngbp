angular.module('comment', [])
    .controller('CommentController', ['$scope', function($scope) {

    }])
    .directive('comments', function() {
        return {
            restrict: 'E',
            scope:false,
            templateUrl: 'comment/comment.tpl.html',
            link: function(scope, element, attr){
                var Comment = Parse.Object.extend("Comment");
                var Product = Parse.Object.extend("Product");
                var User = Parse.Object.extend("User");
                var productQuery = new Parse.Query(Product);
                var commentQuery = new Parse.Query(Comment);
                productQuery.equalTo(attr.onColumn, attr.onValue);
                scope.comment_column = attr.onColumn;
                scope.comment_value = attr.onValue;
                commentQuery.matchesQuery("product", productQuery);
                commentQuery.include("user");
                commentQuery.find({
                    success: function(results){
                        scope.commentlist = [];
                        for(var i=0; i<results.length; i++){
                            var c = {};
                            c['comment'] = results[i].get("comment");
                            u = results[i].get("user");
                            c['username'] = u.get("username");
                            c['date'] = results[i].get("date").toString("yyyy-MM-dd HH:mm:ss");
                            scope.commentlist.push(c);
                        }
                        scope.$digest();
                    }
                });
            }
        };
    })
    .directive('newcomment', function($location, UserFactory){
        return {
            restrict: 'AEC',
            scope: false,
            link: function(scope, element, attr){
                element.on('click', function(event){
                    if (!UserFactory.signedIn()){
                        $location.path('/signup');
                        $location.replace();
                        scope.$apply();
                        return;
                    }
                    var Comment = Parse.Object.extend("Comment");
                    var Product = Parse.Object.extend("Product");
                    var User = Parse.Object.extend("User");
                    var productQuery = new Parse.Query(Product);

                    productQuery.equalTo(scope.comment_column, scope.comment_value);
                    productQuery.find({
                        success:function(results){
                            var currentuser = Parse.User.current();
                            var commenttext = document.getElementById("comment-text").value;
                            var newcomment = new Comment();

                            newcomment.set("comment", commenttext);
                            newcomment.set("user", currentuser);
                            newcomment.set("date", new Date());
                            newcomment.set("product", results[0]);
                            newcomment.save(null, {
                                success: function () {
                                    var c = {};
                                    c['comment'] = commenttext;
                                    c['username'] = currentuser.get("username");
                                    c['date'] = (new Date()).toString("yyyy-MM-dd HH:mm:ss");
                                    scope.commentlist.push(c);
                                    scope.$digest();
                                },
                                error: function(e){
                                    console.log(e);
                                }
                            });
                        }
                    });
                });
            }
        }
    });