var request     = require('request'),
    urlPaser    = require('url'),
    parser      = require('microformat-node'),
    httpCodes   = require('./httpstatus.json'),
    Profile     = require('./profile.js').Profile;
    utils       = require('./utilities.js');
    options     = require('./options.js');


/**
 * Page object
 */
function Page (url, logger, identity, apiInterface) {
  this.url = url;
  this.logger = logger;
  this.html = '';
  this.status = "unfetched";
  this.profile = new Profile(url);
  this.apiInterface = apiInterface;
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

  // fetches page and loads html into object before call parse
  fetch: function(cache, callback){

    this.status = "fetching";
    if(!this.apiInterface){
      this.fetchUrl(cache, callback);
    }else{
      this.fetchApi(cache, callback);
    }

  },


  fetchUrl: function(cache, callback){

    if(this.url){
      this.logger.log('fetch page: ' + this.url);

      // if there is a cache and it holds the url
      if(cache && cache.has(this.url)){
        // http status - content located elsewhere, retrieve from there
        this.statusCode = 305;
        this.requestTime = 0;
        this.html = cache.get(this.url);
        this.logger.log('fetched html from cache: ' + this.url);

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

        request({uri: this.url}, function(requestErrors, response, body){
          if(!requestErrors && response.statusCode === 200){

            self.endedRequest = new Date();
            self.requestTime = self.endedRequest.getTime() - self.startedRequest.getTime();
            self.logger.log('fetched html from page: ' 
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
            self.logger.warn('error requesting page: ' + self.url);
            self.error = 'error: requesting page: ' + self.url;
            self.status = "errored";
            callback();
          }
        });


      }
    }else{
      this.logger.warn('no url given');
      this.error = 'no url given';
      this.status = "errored";
      callback();
    }
  },


  // parses microformats from html 
  parse: function(callback){
    var options = {},
        self = this;

    self.startedUFParse = new Date();
    options.formats = 'hCard,XFN,hResume';
    options.loggingLevel = 4;

    try
    {
      self.logger.info('parsing: ' + self.url);
      parser.parseHtml (self.html, options, self.url, function(err, data){
        if(data && data.microformats){

          if(data.microformats.vcard){
            self.profile.hCards = data.microformats.vcard;
          }

          if(data.microformats.hresume){
            self.profile.hResumes = data.microformats.hresume;
          }

          if(data.microformats.xfn){
            self.profile.xfn = data.microformats.xfn;
          }

        }

        if(callback){
          callback();
        }

      });
    }
    catch(err)
    {
      self.logger.warn('error parsing microformats in page: ' + self.url);
      self.error = err;
      callback();
    }

    self.endedUFParse = new Date();
    self.parseTime = self.endedUFParse.getTime() - self.startedUFParse.getTime();
    self.logger.log('time to parse microformats in page: ' + self.parseTime + 'ms - ' + self.url);
  },


  fetchApi: function(cache, callback){
    
    if(this.apiInterface){
      this.logger.info('fetch data from api: ' + this.apiInterface.name);
    
      var sgn = this.profile.identity.sgn || '',
          self = this;

      try
      {
        this.apiInterface.getProfile(this.url, sgn, this.logger, cache, options, function(hCard){
          if(hCard){
            self.profile.hCards = [hCard];
          }
          self.status = "fetched";
          callback();
        });
      }
      catch(err)
      {
        self.logger.warn('error getting api data with plugin for: ' + self.domain + ' - ' + err);
        self.error = err;
        self.status = "errored";
        callback();
      }
    }


  }

};


exports.Page = Page;

