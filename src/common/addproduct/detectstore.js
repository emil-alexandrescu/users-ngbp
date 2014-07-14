
function makeProxyUrl(url){
    if (url.substr(0,7) === 'http://') {url = 'http://toneproxy.appspot.com/' + url.substr(7);}
    if (url.substr(0,8) === 'https://') {url = 'http://toneproxy.appspot.com/' + url.substr(8);}
    if (url.substr(0,1) === '/') {url = 'http://toneproxy.appspot.com/' + url.substr(1);}
    return url;
}
//basic duck type
function StoreParser() {
    this.store=null;
    /*
     Parsing information from a given product page.  Should return a dictionary:
     {
     "sku":sku_number,
     "id": product id
     "product_name": product_name,
     "current_price" : the_current_price (the price the customer would pay)
     "images" : [array of all available images]
     }
     */
    this.get_product_page_info=function(dom) {
        return {
            "sku":"PRODUCT-1",
            "id": "22",
            "product_name": "Soap",
            "current_price": "23.00",
            "images": ["http://foo.com/x.jpg"]
        }
    }
    this.get_primary_image_element=function(dom) {
        return document.body;
    }
}

function BestBuyParser() {
    this.store="Best Buy";
    this.get_product_page_info=function(dom) {
        var product_info = {};
        var pdp_model_data = $(dom).find('div#pdp-model-data');
        product_info['sku'] = pdp_model_data.attr('data-sku-id');
        product_info['id'] = pdp_model_data.attr('data-product-id');
        product_info['product_name'] = JSON.parse(pdp_model_data.attr('data-names'))['short'];

        product_info['categories'] = [];
        $(dom).find('ul#breadcrumb-list li a').each(function(index){
            if (index > 0){ //exclude "Best Buy"
                product_info['categories'].push($(this).html());
            }
        });

        if ($(dom).find('div.regular-price').eq(0).length>0){
            product_info['current_price'] = $(dom).find('div.regular-price').eq(0).text().match(/[0-9\.]+/)[0];
            product_info['images'] = [];
            var imgs = JSON.parse(pdp_model_data.attr('data-gallery-images'));
            for (var i in imgs) {
                product_info['images'][i] = imgs[i]['url'];
            }
        }
        else{
            product_info['current_price'] = "out of stock";
            product_info['images'] = [];
        }

        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        console.log(null);
        return null;
    }
}
function WalmartParser() {
    this.store="Walmart"
    this.get_product_page_info=function(dom) {
        var product_info = {};
        product_info['product_name'] = $(dom).find('h1.productTitle').eq(0).text();
        product_info['sku'] = $(dom).text().match(/upc:[\s]+'([\d]+)'/)[1];
        product_info['current_price'] = $(dom).text().match(/currentItemPrice:[\s]*([\d\.]+)/)[1];
        product_info['id'] = $(dom).text().match(/itemId:[\s]*([\d\.]+)/)[1];

        product_info['categories'] = [];
        var category_path = $(dom).text().match(/"unitName":[\s]*"([\d\w\-\/&,:]+)"/)[1];
        var category_path_arr = category_path.split('/');
        for (var i = 4; i< category_path_arr.length; i++){
            product_info['categories'].push(category_path_arr[i]);
        }

        product_info['images'] = [];
        if ($(dom).find('.BoxSelection').length === 0){
            product_info['images'][0] = $(dom).find('img#mainImage').attr('src');
        }else{
            $(dom).find('.BoxSelection').each(function(index){
                product_info['images'][index] = $(this).parent().attr('onmouseover').match(/handleSwatchMouseOver\('([\w\d:\/_\-\.]+)'/)[1];
            });
        }

        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        console.log($(dom).find('img#mainImage')[0]);
        return $(dom).find('img#mainImage')[0];
    }

}
/*** MAGENTO PARSER ***/
function MagentoParser() {
    this.store="Magento"
    this.get_product_page_info=function(dom) {
        var product_info = {};
        product_info['product_name'] = $(dom).find('div.product-name h1').eq(0).text();

        var current_price_match = $(dom).text().match(/"basePrice":"([\d\.]+)"/);
        product_info['current_price'] = current_price_match?current_price_match[1]:"";


        var sku_match = $(dom).find('p.sku').eq(0).text().match(/:[\s]*([\w\d]+)/);
        product_info['sku'] = sku_match? sku_match[1] : "";

        var id_match = $(dom).text().match(/"productId":"([\d]+)"/);
        product_info['id'] = id_match?id_match[1]:"";

        product_info['categories'] = [];
        $(dom).find('div.breadcrumbs ul li a').each(function(index){
            if (index > 0){ //exclude "Home"
                product_info['categories'].push($(this).text());
            }
        });
        if (!product_info['categories'].length){
            var url_piece = $(dom).find('meta[property="og:url"]').attr('content').split('/');
            if (url_piece.length>4){
                for (i=3; i<url_piece.length-1; i++){
                    product_info['categories'].push(url_piece[i]);
                }
            }
        }


        product_info['images'] = [];
        $(dom).find('div.more-views a').each(function(index){
            product_info['images'][index] = $(this).attr('href');
        });
        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        console.log($(dom).find('a.product-image img')[0]);
        return $(dom).find('a.product-image img')[0];
    }
}

/*** AMAZON PARSER ***/
function AmazonParser() {
    this.store="Amazon"
    this.get_product_page_info=function(dom) {
        var product_info = {};
        product_info['product_name'] = $(dom).find('#productTitle').text();

        var current_price_match = $(dom).find('#priceblock_ourprice').text().match(/\$([\d\.]+)/);
        product_info['current_price'] = current_price_match?current_price_match[1]:"";

        product_info['sku'] = $(dom).find('#ASIN').val();
        product_info['id'] = $(dom).find('#nodeID').val();

        product_info['categories'] = [];
        $(dom).find('li.breadcrumb a').each(function(index){
            if (index > 0){ //exclude "Home"
                product_info['categories'].push($(this).text().match(/[\w\d\.\-&,\s]+[\w]/)[0]);
            }
        });
        if (!product_info['categories'].length){
            product_info['categories'].push($(dom).find('html').html().match(/data\-category=["']([\w][\w\d\.\-&,]+)['"]/)[1]);
        }

        product_info['images'] = [];
        var imgs = $(dom).text().match(/"main":\{"([\w\d:\/%\._\-]+)"/g);
        var index = 0;
        for (var i = 0; i < imgs.length; i++ ){
            var flag = true;
            var url = imgs[i].substr(9);
            url = url.slice(0, url.length-1);
            for (var j = 0; j<product_info.length; j++){
                if (product_info['images'][j] == url){
                    flag=false;
                    break;
                }
            }
            if (flag){
                product_info['images'][index] = url;
                index ++;
            }
        }
        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        //var imgs = $(dom).text().match(/"main":\{"([\w\d:\/%\._\-]+)"/g);
        //var url = imgs[0].substr(9);


        //it crashes when i am trying to log because src contains the img data not img url

        //var el = $(dom).find('img.a-dynamic-image');
        //el.attr('src', url);
        //console.log(el);
        return $(dom).find('img.a-dynamic-image')[0];
    }
}

/*** TARGET PARSER ***/
function TargetParser() {
    this.store="Target";
    this.get_product_page_info=function(dom) {
        var product_info = {};

        var product_name_match = $(dom).find('.product-name').text().match(/(\b[\w\d].*[$\w\d])/);
        product_info['product_name'] = product_name_match[1];

        product_info['current_price'] = $(dom).find('span.offerPrice').text().substr(1).match(/[\d\.]+/)[0];

        var sku_match = $(dom).find('meta[property="og:url"]').attr('content').match(/\/([\w]+\-[\d]+)/);
        product_info['sku'] = sku_match? sku_match[1] : "";

        product_info['id'] = $(dom).find('input[name="productId"]').val();

        product_info['categories'] = [];
        $(dom).find('div#breadcrumbs span a').each(function(index){
            if (index > 0){ //exclude "target"
                var category = $(this).text().match(/[\s]+([\d\w,&\s]+[\w])[\s]+/)[1];
                if (category === 'Target') {return false;}
                product_info['categories'].push(category);
            }
        });

        product_info['images'] = [];
        $(dom).find('a.scene7.imgAnchor img').each(function(index){
            product_info['images'][index] = $(this).attr('src').replace('_50x50', '');
        });
        console.log(product_info);
        return product_info;
    }
    this.get_primaruky_image_element=function(dom) {
        console.log($(dom).find('a#heroZoomImage.scene7 img')[0]);
        return $(dom).find('a#heroZoomImage.scene7 img')[0];
    }
}

/*** Demandware PARSER ***/
function DemandwareParser() {
    this.store="Demandware";
    this.get_product_page_info=function(dom) {
        var product_info = {};

        product_info['product_name'] =$(dom).find('.product-name').text();

        product_info['current_price'] = $(dom).find('.product-price').find('span[class^=price-]').text().match(/[\d\.]+/)[0];

        product_info['id'] = $(dom).find('span[itemprop="productID"]').text();
        if (!product_info['id']){
            product_info['id'] = $(dom).text().match(/productid[\s]*=[\s]*"([\d\w\-]+)"/i)[1];
        } else{
            product_info['id'] = product_info['id'].match(/[\d\w\-_]+/)[0];
        }
        product_info['sku'] = product_info['id'];

        product_info['categories'] = [];
        $(dom).find('ol.breadcrumb li a').each(function(index){
            if (index > 0){ //exclude "home"
                product_info['categories'].push($(this).text());
            }
        });

        product_info['images'] = [];
        $(dom).find('div.product-thumbnails li.thumb a').each(function(index){
            if ($(this).attr('href').indexOf('#') === -1){
                product_info['images'].push($(this).attr('href'));
            }
        });
        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        console.log($(dom).find('img.primary-image')[0]);
        return $(dom).find('img.primary-image')[0];
    }
}

/*** ATGCommerce PARSER ***/
function ATGCommerceParser() {
    this.store="ATGCommerce";
    this.get_product_page_info=function(dom) {
        var product_info = {};

        var product_name_el = $(dom).find('h1[class*="title"]');
        if (product_name_el.children().length === 0){
            product_info['product_name'] = product_name_el.text().trim();
        }else{
            product_info['product_name'] = product_name_el.children().eq(0).text().trim();
        }
        $(dom).find("[class$='-price']").each(function(){
            if (m = $(this).text().match(/([\d]+\.[\d]+)|([\d]+)/)){
                product_info['current_price'] = m[0];
                return false;
            }
        });
        product_info['categories'] = [];
        var product_id_el = $(dom).find('input').filter(function() {

            var str = $(this).attr('id') || $(this).attr('class');
            if (str == null) {return false;}
            return (str.toLowerCase().indexOf('productid') > -1);
        });
        product_info['id'] = product_id_el.val();

        var product_sku_el = $(dom).find('input[type="hidden"]').filter(function() {
            var str = $(this).attr('id') || $(this).attr('class');
            if (str == null) {return false;}
            return (str.toLowerCase().indexOf('skuid') > -1);
        });
        product_info['sku'] = product_sku_el.val();

        product_info['images'] = [];
        $(dom).find('[class*="thumb"] a').each(function(index){
            if ($(this).attr('href').indexOf('#') === -1){
                product_info['images'].push($(this).attr('href'));
            }

        });
        console.log(product_info);
        return product_info;
    }
    this.get_primary_image_element=function(dom) {
        if ($(dom).find('[class*="prod"][class*="im"] img').length>0)
        {
            console.log($(dom).find('[class*="prod"][class*="im"] img')[0]);
            return $(dom).find('[class*="prod"][class*="im"] img')[0];
        }
        return null;
    }
}

//sniffs the dom for the store type.
//would return null or BestBuyParser or WalmartParser or MagentoParser
function detectStore(dom) {
    var site_name = $(dom).find('meta[property="og:site_name"]')!==undefined ? $(dom).find('meta[property="og:site_name"]').attr('content') : null;
    if (site_name == null) {
        if (/Mage\.Cookies\.domain/.test($(dom).text())) {site_name = "Magento";}
        if (/Amazon\.com/.test($(dom).find('.nav_last').text())) {site_name = "Amazon";}
        if ($(dom).find('link[rel^="shortcut"]') && (/demandware/.test($(dom).find('link[rel^="shortcut"]').attr('href')))) {site_name = "Demandware";}
        if ($(dom).find("input[name^=\"\/atg\/commerce\"]").length>0) {site_name = "ATGCommerce";}
    }
    switch (site_name){
        case 'Walmart.com':
            return new WalmartParser();
        case 'Best Buy':
            return new BestBuyParser();
        case 'Magento':
            return new MagentoParser();
        case 'Target':
            return new TargetParser();
        case 'Amazon':
            return new AmazonParser();
        case 'Demandware':
            return new DemandwareParser();
        case 'ATGCommerce':
            return new ATGCommerceParser();
        default:  //magento
            return null;
    }
}
