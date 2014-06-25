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
                        //declare classes
                        var Product = Parse.Object.extend("Product");
                        var ProductImage = Parse.Object.extend("ProductImage");
                        var User = Parse.Object.extend("User");
                        var currentuser = Parse.User.current();

                        var productQuery = new Parse.Query(Product);
                        productQuery.equalTo("URL", scope.productUrl);
                        produttQuery.equalTo("user", currentuser);
                        productQuery.count({
                           success: function(count){
                               if (count>0){
                                   alert('Duplicate Product!');
                                   return;
                               }else{
                                   var productobj = new Product();
                                   productobj.save({
                                       store: storeParser.store,
                                       URL: scope.productUrl,
                                       productName: product_info['product_name'],
                                       currentPrice: product_info['current_price']*1,
                                       productID: product_info['id'],
                                       SKU: product_info['sku'],
                                       user: currentuser
                                   }).then(function(object) {
                                           console.log(object);
                                           //save images
                                           var i =0;
                                           var saved_files = 0;
                                           function convertImageCallback(base64Img, base64Thumb){
                                               var file = new Parse.File(storeParser.store+'_'+product_info['id']+'_'+i+'.'+ext, { base64: base64Img });
                                               var filethumb = new Parse.File(storeParser.store+'_'+product_info['id']+'_'+i+'_thumb.'+ext, { base64: base64Thumb });

                                               filethumb.save().then(function(data){
                                                   file.save().then(function(data){

                                                       var imgobj = new ProductImage();
                                                       imgobj.set("image", file);
                                                       imgobj.set("thumb", filethumb);
                                                       //set relation to product
                                                       imgobj.set("parent", object);
                                                       imgobj.save().then(function(data){
                                                           saved_files ++;
                                                           if (saved_files === product_info['images'].length){
                                                               alert("Product saved successfully!");
                                                           }
                                                       });
                                                       console.log(imgobj);
                                                   }, function(error){
                                                       console.log(error);
                                                   })
                                               });
                                           }
                                           for (i =0; i<product_info['images'].length; i++){
                                               var ext = product_info['images'][i].substr(product_info['images'][i].length-3).toLowerCase();
                                               if (product_info['images'][i].substr(0,1) == '/' ) {
                                                   product_info['images'][i] = "http://" + product_info['images'][i].substr(1);
                                               }
                                               convertImgToBase64(product_info['images'][i], convertImageCallback);
                                           }
                                       }); //productobj save
                               }
                           }
                        });

                        //save product

                    });  //ajax
                }); //element click
            }
        }
    });