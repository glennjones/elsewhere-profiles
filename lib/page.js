var request = require('request'),
    urlPaser = require('url'),
    parser = require('microformat-node'),
    httpCodes = require('./httpstatus.json'),
    Profile = require('./profile.js').Profile;
    utils = require('./utilities.js');


/**
 * Page object
 */
function Page (url, logger) {
  this.url = url;
  this.logger = logger;
  this.html = '';
  this.profile = new Profile(url);

  // if a identity is passed add it to the object
  if(arguments.length > 2){
    this.profile.identity = arguments[2];
  }else{
    // else add a small identity stub with the info with have
    this.profile.identity = {
      'indentity': {
        'domain': urlPaser.parse(url).hostname,
        'matchedUrl': url
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

    var self = this;
    self.logger.log('fetch page: ' + this.url);
    

    if(this.url){
      // if there is a cache and it holds the url
      if(cache && cache.has(this.url)){
        // http status - content located elsewhere, retrieve from there
        self.statusCode = 305;
        self.requestTime = 0;
        self.html = cache.get(self.url);
        self.logger.log('fetched html from cache: ' + self.url);

        self.parse(function(){
          callback(self);
        })

      // if not get the html from the url  
      }else{
        this.startedRequest = new Date();
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
              callback(self);
            })

          }else{
            self.logger.warn('error requesting page: ' + self.url);
            self.error = 'error: requesting page: ' + self.url;
            callback(self);
          }
        });

      }
    }else{
      self.logger.warn('no url given');
      self.error = 'no url given';
      callback(self);
    }
  },

  // parses microformats from html 
  parse: function(callback){
    var options = {},
        self = this;

    self.startedUFParse = new Date();
    options.format = 'hCard,XFN,hResume';
    
    try
    {
      self.logger.info('parsing: ' + self.url);
      parser.parseHtml (self.html, options, function(ufData){
        if(ufData.microformats.vcard)
          self.profile.hCards = ufData.microformats.vcard;

        if(ufData.microformats.hresume)
          self.profile.hResumes = ufData.microformats.hresume;

        if(ufData.microformats.xfn)
          self.profile.xfn = ufData.microformats.xfn;

        if(callback)
          callback();

      }, self.url);
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
  }

};


exports.Page = Page;

