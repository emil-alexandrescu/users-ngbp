//we only assume it is used in extension

BestBuyParser.prototype.get_cart_box=function(dom, callback){
    var cartbox_url;
    cartbox_url = $(dom).find("div#cart a").eq(0).attr("href");
    $.ajax({
        url: cartbox_url
    }).done(function(response){
        var url_match = response.match(/"itemUrl":"([\d\w\/\+\-%\.\?&=]+)"/g);
        var url_array = [];
        if (url_match != null){
            for (var i=0; i<url_match.length; i++){
                var str = url_match[i].substr('"itemUrl":"'.length);
                str = str.substr(0, str.length-1);
                url_array.push(str);
            }
            callback(url_array);
        }else{
            callback(null);
        }
    })
}

WalmartParser.prototype.get_cart_box = function(dom, callback){
    var cartbox_url;
    cartbox_url = "/cart2/pCartMouseOver.do";
    $.ajax({url: cartbox_url}).done(function(response){
        var url_match = response.match(/"itemURL":"([\d\w\/\+\-%\.\?&=]+)"/g);
        var url_array = [];
        if (url_match != null){
            for (var i=0; i<url_match.length; i++){
                var str = url_match[i].substr('"itemUrl":"'.length);
                str = str.substr(0, str.length-1);
                url_array.push(str);
            }
            callback(url_array);
        }else{
            callback(null);
        }
    })
}

TargetParser.prototype.get_cart_box = function(dom, callback){
    var cartbox_url = "/checkout_minicart";
    $.ajax({
        url: cartbox_url,
        dataType: "json"
    }).done(function(response){
            try{
                var parser = new DOMParser();
                var cartbox_dom = parser.parseFromString(response["items"], "text/html");
                console.log(cartbox_dom);
                var url_array = [];
                $(cartbox_dom).find("p.link a").each(function(){
                    url_array.push($(this).attr('href'));
                });
                callback(url_array);
            }catch(e){
                console.log(e);
                callback(null);
            }
        })
}

MagentoParser.prototype.get_cart_box = function(dom, callback){
    var url_array = [];
    try{
        $(dom).find('div.product-details .product-name a').each(function(){
            url_array.push($(this).attr('href'));
        });
        callback(url_array);
    }catch(e){
        console.log(e);
        callback(null);
    }
}

AmazonParser.prototype.get_cart_box = function(dom, callback){
    var cartbox_url = "/gp/navigation/ajax/dynamicmenu.html";
    $.ajax({
        url:cartbox_url,
        dataType: "json"
    }).done(function(response){
        var url_array = [];
        try{
            for (var i=0; i< response['cart']['items'].length; i++){
                url_array.push(response['cart']['items'][i]['url']);
            }
            callback(url_array);
        }catch(e){
            console.log(e);
            callback(null);
        }
    });
}

DemandwareParser.prototype.get_cart_box = function(dom, callback){
    var url_array = [];
    try{
        $(dom).find('.mini-cart-products .mini-cart-product .mini-cart-name a').each(function(){
            url_array.push($(this).attr('href'));
        });
        callback(url_array);
    }catch(e){
        console.log(e);
        callback(null);
    }
}

ATGCommerceParser.prototype.get_cart_box = function(dom, callback){
    var pos1 = $(dom).text().indexOf('items');
    var text1 = $(dom).text().substr(0, pos1);
    var pos2 = text1.lastIndexOf('href');
    var text2 = text1.substr(pos2);
    var cartbox_url = '';
    if (pos1>=0 && pos2>=0){
        cartbox_url = text2.match(/"href":"([\d\w\/\+\-%\.\?&=]+)"/);
        try{
            cartbox_url = cartbox_url[1];
        }catch(e){
            callback(null);
            return;
        }
        if (cartbox_url){
            $.ajax({
                url: cartbox_url
            }).done(function(response){
                var parser = new DOMParser();
                var cartbox_dom = parser.parseFromString(response, "text/html");
                var url_array = [];
                    try{
                        $(cartbox_dom).find(".product").each(function(){
                            url_array.push($(this).find("a").eq(0).attr('href'));
                        });
                        callback(url_array);
                    }catch(e){
                        console.log(e);
                        callback(null);
                    }

            });
        }
    }
}