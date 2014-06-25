angular.module('like', [])
    .directive('like', function() {
        return {
            restrict: 'E',
            scope:false,
            templateUrl: 'like/like.tpl.html',
            link: function(scope, element, attr){
                var Like = Parse.Object.extend("Like");
                var Product = Parse.Object.extend("Product");
                var User = Parse.Object.extend("User");
                var productQuery = new Parse.Query(Product);
                var likeQuery = new Parse.Query(Like);
                productQuery.equalTo(attr.onColumn, attr.onValue);
                scope.like_column = attr.onColumn;
                scope.like_value = attr.onValue;
                scope.likecount = 0;
                likeQuery.matchesQuery("product", productQuery);
                likeQuery.equalTo("score", 1);
                likeQuery.count({
                    success: function(count){
                        scope.likecount = count;
                        scope.$digest();
                    }
                });
            }
        };
    })
    .directive('newlike', function($location, UserFactory){
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
                    var Like = Parse.Object.extend("Like");
                    var Product = Parse.Object.extend("Product");
                    var User = Parse.Object.extend("User");
                    var productQuery = new Parse.Query(Product);

                    productQuery.equalTo(scope.like_column, scope.like_value);
                    productQuery.find({
                        success:function(result_product){
                            var currentuser = Parse.User.current();
                            var likeQuery = new Parse.Query(Like);
                            likeQuery.equalTo("user", currentuser);
                            likeQuery.equalTo("product", result_product[0]);
                            likeQuery.count({
                                success: function(count){
                                    if (count === 0){
                                        var newlike = new Like();
                                        newlike.set("user", currentuser);
                                        newlike.set("product", result_product[0]);
                                        newlike.set("score", 1);
                                        newlike.save(null, {
                                           success:function(){
                                               scope.likecount++;
                                               scope.$digest();
                                           }
                                        });
                                    }
                                }
                            }); // end of like query
                        }
                    });//end of product Query
                });
            }
        }
    });