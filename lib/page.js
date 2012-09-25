var request = require('request'),
    parser = require('microformat-node'),
    httpCodes = require('./httpstatus.json'),
    Profile = require('./profile.js').Profile;

/**
 * Page object
 */
function Page (url) {
  console.log('created page object: ' + url);
  this.url = url;
  this.html = '';
  this.profile = new Profile(url);
  this.statusCode = 0;
  this.error = '';
}


Page.prototype = {
  constructor: Page,

  // fetches page and loads html into object before call parse
  fetch: function(callback){
    if(this.url){
      // create self object to hold context through async operation
      var self = this;
      request({uri: this.url}, function(requestErrors, response, body){
        if(!requestErrors && response.statusCode === 200){

          self.statusCode = response.statusCode;
          self.html = body;

          self.parse(function(){
            // pass back page object to parent pages object
            callback(self);
          })

        }else{
          self.error = 'error: '
          callback(self);
        }
      });

    }
  },

  // parses microformats from html 
  parse: function(callback){
    var options = {},
        self = this;
    options.format = 'hCard,XFN,hResume';

    try
    {
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
      self.error = err;
      callback();
    }
  }

};


exports.Page = Page;

