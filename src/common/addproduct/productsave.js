function changeUrl(url){
    if (url.substr(0,1) == '/') {url = 'http:/' + url;}
    return url;
}
function productSave(product_info, storeParser, productUrl, currentuser, func){
    var Product = Parse.Object.extend("Product");
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
                Parse.Cloud.run('sign_cloudinary_upload_request',{}).
                    then(function(object){
                        console.log(object);
                        try{
                            var promises = [];
                            for (var j = 0; j < product_info['images'].length; j++){
                                promises.push(Parse.Cloud.run('upload_image', {
                                    file: changeUrl(product_info['images'][j]),
                                    signature: object.signature,
                                    timestamp: object.timestamp,
                                    api_key: object.api_key
                                }));
                            }
                            return Parse.Promise.when(promises);
                        }catch(e){
                            console.log(e);
                        }
                        return null;
                    }).then(function(){
                        console.log(arguments);
                        var image_ids = [];
                        for (var i in arguments){
                            var new_cloudinaryobj = JSON.parse(arguments[i]);
                            image_ids.push(new_cloudinaryobj['public_id']);
                        }
                        var productobj = new Product();
                        productobj.save({
                            store: storeParser.store,
                            URL: productUrl,
                            productName: product_info['product_name'],
                            currentPrice: product_info['current_price']*1,
                            productID: product_info['id'],
                            SKU: product_info['sku'],
                            user: currentuser,
                            productImages: image_ids,
                            mainImage: image_ids[0],
                            categories: product_info['categories']
                        }).then(function(object) {
                                console.log(object);
                            });
                    });
            }
        }
    });
}