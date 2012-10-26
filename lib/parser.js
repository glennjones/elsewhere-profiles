var url = require('url'),
    _               = require('underscore')._,
    Pages           = require('./pages.js'),
    utils           = require('./utilities.js'),
    internalLogger  = require('./logger.js'),
    internalCache   = require('./cache.js'),
    internalOptions = require('./options.js'),
    plugins         = require('./plugins');

_.mixin(require('underscore.Deferred'));
 

/**
 * Get profiles from a comma delimited list of urls
 * urls: comma delimited list of urls
 * options: an object contain options - optional
 * callback: a function which is passes back profiles object  
 */
parseUrls = function(urls, options, callback){
  var out = [],
      cache,
      logger,
      deferred = _.Deferred(),
      promise  = deferred.promise();

  // allows for finction call without options
  if (arguments.length === 2) {
    callback = options;
    options = {};
  }
  mergeOptions(options);



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
  // If we we have any urls to parse
  if(out.length >= 0){
      // Create a new instance of pages object
      var pages = new Pages.Pages (out, options, function(data){
          callback(null, data.toJson());
          deferred.resolve(null, data.toJson());
      })
  }else{
      callback(null, {});
      deferred.resolve(null, {});
  } 
}  


/**
 * Get profiles from elsewhere-mapper json string
 * json: elsewhere-mapper json string
 * options: an object contain options - optional
 * callback: a function which is passes back profiles object  
 */
parseElsewhereJson = function(json, options, callback){
  var cache, 
      logger,
      deferred = _.Deferred(),
      promise  = deferred.promise();

  // allows for finction call without options
  if (arguments.length === 2) {
    callback = options;
    options = {};
  }
  mergeOptions(options);


  // if we we have any identities to parse
  if(json.identities && json.identities.length >= 0){
      // Create a new instance of pages object
      var pages = new Pages.Pages (json, options, function(data){
          callback(null, data.toJson());
          deferred.resolve(null, data.toJson());
      })
  }else{
      callback(null,{});
      deferred.resolve(null, {});
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


// merges passed and default options
mergeOptions = function(options){
  // add interface for cache and logger
  options.cache = (options.cache)? options.cache : internalCache;
  options.logger = (options.logger)? options.logger : internalLogger;

  // single level clone of missing properties
  for (var key in internalOptions) {
    if (internalOptions.hasOwnProperty(key)) {
      if(!options[key]){
        options[key] = internalOptions[key];
      }
    }
  }
  // set options within cache and logger objects
  if(options.logger.setLogLevel){
    options.logger.setLogLevel( options.logLevel );
  }
  if(options.cache.setCacheLimits){
    options.cache.setCacheLimits( options.cacheTimeLimit, options.cacheItemLimit, options.logger );
  }
}


exports.parseUrls = parseUrls;
exports.parseElsewhereJson = parseElsewhereJson;
