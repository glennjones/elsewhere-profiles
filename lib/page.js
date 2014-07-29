var request     = require('request'),
    urlPaser    = require('url'),
    parser      = require('microformat-node'),
    httpCodes   = require('./httpstatus.json'),
    Profile     = require('./profile.js').Profile,
    utils       = require('./utilities.js');


/**
 * Page object
 */
function Page (url, identity, apiInterface, options) {
  this.url = url;
  this.options = options;
  this.apiInterface = apiInterface;
  this.html = '';
  this.status = "unfetched";
  this.profile = new Profile(url);
  this.domain = '';

  if(url && url !== ''){
    this.domain = urlPaser.parse(url).hostname;
  }

  // if a identity is passed add it to the object
  if(identity){
    this.profile.identity = identity;
  }else{
    // else add a small identity stub with the info with have
    this.profile.identity = {
      'indentity': {
        'domain': this.domain,
        'matchedUrl': this.url
      }
    };
  }

  this.statusCode = 0;
  this.error = '';
}



Page.prototype = {
  constructor: Page,


  // get data from different sources
  fetch: function(callback){
    this.status = "fetching";

    // if we have a plug-in use that instead of open data parse
    if(!this.apiInterface){
      this.fetchUrl(callback);
    }else{
      this.fetchApi(callback);
    }
  },


  // fetches page and loads html into object before call parse
  fetchUrl: function(callback){
    var options = this.options,
        cache = this.options.cache,
        logger =  this.options.logger;


    if(this.url){
      logger.log('fetch page: ' + this.url);

      // if there is a cache and it holds the url
      if(cache &&cache.has(this.url)){
        // http status - content located elsewhere, retrieve from there
        this.statusCode = 305;
        this.requestTime = 0;
        this.html = cache.get(this.url);
        logger.log('fetched html from cache: ' + this.url);

        this.parse(function(){
          callback(this);
        })

      // if not get the html from the url  
      }else{

        this.startedRequest = new Date();
        var self = this;

        var requestObj = {
          uri: this.url,
          headers: options.httpHeaders
        }

        request(requestObj, function(requestErrors, response, body){
          if(!requestErrors && response.statusCode === 200){

            self.endedRequest = new Date();
            self.requestTime = self.endedRequest.getTime() - self.startedRequest.getTime();
            logger.log('fetched html from page: ' 
              + self.requestTime + 'ms - ' + self.url);
            
            self.statusCode = response.statusCode;
            self.html = body;

            if(cache){
              cache.set(self.url, body);
            }

            self.parse(function(){
              self.status = "fetched";
              callback(self);
            })

          }else{
            logger.warn('error requesting page: ' + self.url);
            self.error = 'error requesting page: ' + self.url;
            self.status = "errored";
            callback();
          }
        });


      }
    }else{
      logger.warn('no url given');
      this.error = 'no url given';
      this.status = "errored";
      callback();
    }
  },


  // parses microformats from html 
  parse: function(callback){
    var options = {},//  utils.clone( this.options ),
        self = this;

    options.baseUrl = self.url;

    self.startedUFParse = new Date();
    //console.log(self.url)

    try
    {
      parser.parseHtml (self.html, options, function(err, data){

        //console.log( JSON.stringify(data) );
        if(data){

          self.profile.hCards = self.getArrayOfContentType(data, 'h-card' );
          self.profile.hResumes = self.getArrayOfContentType(data, 'hresume' );
          self.profile.xfn = self.getArrayOfContentType(data, 'xfn' );

        }
        if(callback){
          callback();
        }
      });
    }
    catch(err)
    {
      self.options.logger.warn('error parsing microformats in page: ' + self.url);
      self.error = err;
      callback();
    }

    self.endedUFParse = new Date();
    self.parseTime = self.endedUFParse.getTime() - self.startedUFParse.getTime();
    self.options.logger.log('time to parse microformats in page: ' + self.parseTime + 'ms - ' + self.url);
  },


  getArrayOfContentType: function( data, name ){
    var out = [];
    if(data && data.items){
      var i = data.items.length;
      while (i--) {
        if(data.items[i].type && data.items[i].type.indexOf(name) > -1){
          out.push(data.items[i]);
        }
      }
    }
    return out;
  },


  // uses plug-in interface to get profile from an api
  fetchApi: function(callback){
    var options = this.options,
        cache = this.options.cache,
        logger =  this.options.logger;
    
    if(this.apiInterface){
      logger.info('fetch data from api: ' + this.apiInterface.name);
    
      var sgn = this.profile.identity.sgn || '',
          self = this;

      try
      {
        this.apiInterface.getProfile(this.url, sgn, options, function(hCard){
          if(hCard){
            self.profile.hCards = [hCard];
          }
          self.status = "fetched";
          callback();
        });
      }
      catch(err)
      {
        logger.warn('error getting api data with plugin for: ' + self.domain + ' - ' + err);
        self.error = err;
        self.status = "errored";
        callback();
      }
    }


  }

};


exports.Page = Page;

