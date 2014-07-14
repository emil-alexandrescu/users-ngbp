angular.module('addproduct', [])
    .directive('addproduct', function() {
        return {
            restrict: 'E',
            scope:false,
            templateUrl: 'addproduct/addproduct.tpl.html'
        };
    })
    .directive('addproductButton', function($location, UserFactory){
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
                    var url = scope.productUrl;
                    if (url.substr(0,7) == 'http://') {url = 'http://toneproxy.appspot.com/' + url.substr(7);}
                    if (url.substr(0,8) == 'https://') {url = 'http://toneproxy.appspot.com/' + url.substr(8);}
                    $.ajax({url:url}).done(function(response) {
                        var parser = new DOMParser();
                        var dom = parser.parseFromString(response, "text/html");
                        var storeParser=detectStore(dom);
                        //storeParser.get_cart_box(dom);


                        var product_info;
                        try{
                            product_info = storeParser.get_product_page_info(dom);
                        }catch(e){
                            product_info = null;
                        }
                        if (product_info==null) {
                            alert('No product found!');
                            return;
                        }

                        var User = Parse.Object.extend("User");
                        var currentuser = Parse.User.current();

                        productSave(product_info, storeParser, scope.productUrl, currentuser);
                    });  //ajax
                }); //element click
            }
        }
    });