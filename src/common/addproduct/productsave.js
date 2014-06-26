function productSave(product_info, storeParser, productUrl, currentuser, func){
    var Product = Parse.Object.extend("Product");
    var ProductImage = Parse.Object.extend("ProductImage");
    var User = Parse.Object.extend("User");

    var productQuery = new Parse.Query(Product);
    productQuery.equalTo("URL", productUrl);
    productQuery.equalTo("user", currentuser);
    productQuery.count({
        success: function(count){
            if (count>0){
                alert('Duplicate Product!');
                return;
            }else{
                var productobj = new Product();
                productobj.save({
                    store: storeParser.store,
                    URL: productUrl,
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
                                            if (typeof(func) == "function") {
                                                func.call();
                                            }
                                        }
                                    });
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
}