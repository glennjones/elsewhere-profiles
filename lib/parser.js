var url = require('url'),
    Pages = require('./pages.js'),
    utils = require('./utilities.js'),
    shiv = require('microformat-node');
    
 
/**
 * Get profiles from a comma delimited list of urls
 * urls: comma delimited list of urls
 * callback: a function which is passes back profiles object  
 */
parseUrls = function(urls, callback){
    console.log('parseUrls')
    var out = [];

    // break comma delimeted string into an array of urls
    if(urls.indexOf(',') > 0){
        urls = urls.split(',');
        var i = urls.length,
            x = 0;

        while (x < i) {
            if(utils.trim(urls[x]) !== '')
                out.push(utils.trim(urls[x]))
            x++;
        }
    }else{
        if(utils.trim(urls) !== '')
            out[0] = utils.trim(urls)
    }
    parseUrlArray(out, null, callback);
}  


/**
 * Get profiles from elsewhere-mapper json string
 * json: elsewhere-mapper json string
 * callback: a function which is passes back profiles object  
 */
parseElsewhereJson = function(json, callback){
    console.log('parseElsewhereJson')
    var objs = json.identities,
        i = objs.length,
        x = 0;
        out = [];
    // loop the identies and get profile urls
    while (x < i) {
        var hcard = getEndPoints(objs[x].endPoints, 'Profile', 'hCard'),
            hresume = getEndPoints(objs[x].endPoints, 'Profile', 'hResume');
        // if we find a resume use that
        if(hresume) {  
            out.push(hresume)
        }else{
            if(hcard)
                out.push(hcard)
        }
        x++;
    }
    parseUrlArray(out, json, callback);
}


/**
 * Get profiles from an array url strings
 * urls: an array url strings
 * callback: a function which is passes back profiles object  
 */
parseUrlArray = function(urls, identities, callback){
    // If we we have any urls to parse
    if(urls.length >= 0){
        // Create a new instance of pages object
        var pages = new Pages.Pages (urls, identities, function(data){
            callback(Pages.postProcess(data));
        })
    }else{
        callback({});
    } 
}



// get a data endpoint for a give contentType and/or schema
getEndPoints = function(endPoints, contentType, schema){
   var i = endPoints.length,
       x = 0;
   while (x < i) {
      if(!schema){
         if(endPoints[x].contentType === contentType)
            return endPoints[x].url;
      }else{
         if(endPoints[x].contentType === contentType 
            && endPoints[x].schema === schema)
            return endPoints[x].url;
      }
      x++;
   }
   return null;
}




exports.parseUrls = parseUrls;
exports.parseElsewhereJson = parseElsewhereJson;
exports.parseUrlArray = parseUrlArray;



