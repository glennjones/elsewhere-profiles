var urlPaser    = require('url'),
    _           = require('underscore')._,
    Page        = require('./page.js').Page,
    plugins     = require('./plugins');
    utils       = require('./utilities.js');


/**
 * Pages object
 */
function Pages (objs, cache, logger, callback){
  this.pageCollection = [];
  this.completed = 0;
  this.urls = [];
  this.startedParse = new Date();
  this.profiles = [];
  this.combinedProfile = {},
  this.noProfilesFound = [];
  this.cache = cache;
  this.logger = logger;


  // turn array of url strings into an array of page objects
  if(utils.isString(objs[0])){
    this.urls = objs;
    var i = this.urls.length,
        x = 0;
    while (x < i) {
      var domain = urlPaser.parse(this.urls[x]).host;
      var apiInterface = getPluginInterface(domain);
      this.pageCollection.push(new Page(this.urls[x], logger, null, apiInterface))
      x++;
    }


  // turn array of identity objects into an array of page objects
  }else{

    var identities = objs.identities
        i = identities.length,
        x = 0;
    while (x < i) {
      // Look for API plugin first
      var url = getProfileUrl(identities[x]);
      var apiInterface = getPluginInterface(identities[x].domain);
      if(url) {this.urls.push(url)};
      // only add pages for sites/api's we can get profiles from
      if(url || apiInterface){
        this.pageCollection.push(new Page(url, logger, identities[x], apiInterface))
      }
      x++;
    }

    // add metadata from mapper objects
    this.username = commonUserName(identities, this.logger);
    this.highestFrequencySite = highestFrequencySite(objs, false, this.logger);
    this.accounts = getAccountIdentities(identities, this.logger);
  }


  var self = this;

  // call to fetch method to get all data
  this.fetch(cache, function(data){
    self.endedParse = new Date();

    // post process raw data 
    var coll = self.pageCollection,
        i = coll.length,
        x = 0,
        totalRequestTime = 0,
        totalParseTime = 0;

    while (x < i) {
        coll[x].profile.findRepresentativehCard(self.urls);

        if(utils.hasProperties(coll[x].profile.representativehCard)){
          self.profiles.push(coll[x].profile.toJson());
        }else{
          self.noProfilesFound.push(coll[x].profile.toJson().identity);
        }

        if(coll[x].requestTime){
          totalRequestTime += coll[x].requestTime;
        } 

        if(coll[x].parseTime){
          totalParseTime += coll[x].parseTime;
        }

        x++;
    }

    self.logger.info('total html request time: ' + totalRequestTime + 'ms');
    self.logger.info('total microformats parse time: ' + totalParseTime + 'ms');


    self.combinedProfile = combineProfiles(self.profiles, self.logger);


    // add common username
    if(self.username !== ''){
      self.combinedProfile.username = self.username;
    }

    // add highest frequency site
    if(self.highestFrequencySite !== ''){
      self.combinedProfile.highestFrequencySite = self.highestFrequencySite;
    }

    // add account info into combinedProfile
    if(self.accounts && self.accounts.length !== 0){
      self.combinedProfile.accounts = self.accounts;
    }    


    self.logger.info('total time taken: ' 
      + (self.endedParse.getTime() - self.startedParse.getTime()) + 'ms');

    callback(data);
  });
}



Pages.prototype = {
  constructor: Pages,

  // fetch all the pages
  fetch: function(cache, callback){
    var self = this;

    // this is called once a page is fully parsed
    whenPageIsFetched = function(){
      self.completed ++;
      if(self.completed === self.pageCollection.length){
        callback(self);
      } else {
        findUnfetchedPages();
      }  
    }

    findUnfetchedPages = function(){ 
      _.each(self.pageCollection, function (page) {
        if (page.status === "unfetched") {
          page.fetch(cache, whenPageIsFetched);
        }
      });
    },

    findUnfetchedPages();
  }, 


  // converts the data structure into a compact version for output
  toJson: function (){
    var out = {}

    if(this.profiles.length !== 0){
      out.profiles = this.profiles
    }

    if(this.noProfilesFound.length !== 0){
      out.noProfilesFound = this.noProfilesFound;
    }

    if(utils.hasProperties(this.combinedProfile)){
      out.combinedProfile = this.combinedProfile
    }

    return out;
  }

}


getProfileUrl = function (obj){
  var hcard = getEndPoints(obj.endPoints, 'Profile', 'hCard'),
      hresume = getEndPoints(obj.endPoints, 'Profile', 'hResume');

  if(hresume) {  
      return hresume
  }else{
      if(hcard)
          return hcard
  }
  return null
}


getPluginInterface = function(domain){
  // loop the plugins collection
  var i = plugins.collection.length;
  while (i--) {
    var domains = plugins.collection[i].plugin.domains;
    var y = domains.length;
    // loop the domains supported by a plugin
    while (y--) {
      if(domain === domains[y])
      return plugins.collection[i].plugin
    }
  }
  return null;
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



// find the most common username by freguency of use
function commonUserName(objs, logger){
  logger.info('finding common username');
  var i = objs.length,
      x = 0
      usernames = [],
      highest = 0, 
      out ='';

  while (x < i) {
      appendName(objs[x].userName);
      x++;
  }

  var i = usernames.length;
  while (i--) {
    if(usernames[i].count > highest){
      highest = usernames[i].count;
      out = usernames[i].name;
    }
  }

  function appendName(userName){
    var i = usernames.length;
    while (i--) {
      if(usernames[i].name === userName){
        usernames[i].count ++;
        return;
      }
    }
    usernames.push({
      'name': userName, 
      'count': 1
    })
  }

  return out;
}


// finds the site url with the highest freguency number
// noIdentities: if set to true this will most likely return personnel owned domains like a blog
function highestFrequencySite(objs, noIdentities, logger ){
  logger.info('finding highest frequency site');
  var highest = 0, 
      out ='';

  if(!noIdentities)    
    findHighest(objs.identities);   

  findHighest(objs.domainsNotMapped);  

  function findHighest(arr){
    var i = arr.length,
        x = 0;
    while (x < i) {
      if(arr[x].frequency > highest){
        highest = arr[x].frequency;
        out = (arr[x].matchedUrl) ? arr[x].matchedUrl : arr[x].url;
      }
      x ++;
    }
  }    

  return out;
}


function getAccountIdentities(identities) {
    var i = identities.length,
        x = 0,
        out = [];
    while (x < i) {
      var profileUrl = getEndPoints(identities[x].endPoints, 'Profile');
      var item = {
          "name": identities[x].name,
          "domain": identities[x].domain,
          "userName": identities[x].userName,
          "sgn": identities[x].sgn,
          "icon16" : identities[x].icon16,
          "frequency" : identities[x].frequency
        }
      if(profileUrl){
        item.profileUrl = profileUrl;
      }else{
        item.profileUrl = '';
      }
      out.push(item);
      x ++;
    }
    return out;
}


// combines profiles 
function combineProfiles(profiles, logger){
  logger.info('building combined profile');

  var i = profiles.length,
      x = 0
      out = {};

  while (x < i) {

    var profile = profiles[x].profile;

    // append the simple single value properties
    var singleProps = ['fn','n','bday','class','geo','rev','role','sort-string','tz','uid'];
    var z = singleProps.length;
    while (z--) {
      getAppend(singleProps[z], profile, out, singleProps[z]);
    }

    // append multiple occurrence properties where only want the first item
    var firstItemProps = ['key','label','logo','mailer','nickname','photo','sound','title', 'org'];
    z = firstItemProps.length;
    while (z--) {
      getAppend(firstItemProps[z], profile, out, firstItemProps[z]);
    }

    // append address with the largest number of elements
    if(profile.adr){
      if(!out.adr ){
        out.adr = [];
        out.adr[0] = profile.adr[0];
      }else{
        if(rateAddress(profile.adr[0]) > rateAddress(out.adr[0]))
          out.adr[0] = profile.adr[0];
      }
    }

    // append urls into a single list
    if(profile.url){
      if(!out.url)
        out.url = [];
      z = profile.url.length;
      while (z--) {
        appendUrl(profile.url[z], out.url);
      }
    }

    // append email address into a single list
    if(profile.email){
      if(!out.email)
        out.email = [];
      z = profile.email.length;
      while (z--) {
        appendValueType(profile.email[z], out.email, 'email');
      }
    }

    // append email address into a single list
    if(profile.tel){
      if(!out.tel)
        out.tel = [];
      z = profile.tel.length;
      while (z--) {
        appendValueType(profile.tel[z], out.tel, 'tel');
      }
    }

    // add the longest note
    if(profile.note){
      if(!out.note){
        out.note = [];
        out.note[0] = profile.note[0];
      }else{
        if(profile.note[0].length > out.note[0].length)
          out.note[0] = profile.note[0];
      }
    }

    x++;
  }

  return out;
}


// append a email/tel if it is not already in the right array
function appendValueType(obj, arr, filterType) {
    var i = arr.length
        found = false;
    while (i--) {
        if (arr[i].value === obj.value) 
          found = true; 
    }
    if (filterType === 'email') {
      if(utils.isEmail(obj.value)){
        arr.push(obj);
      }
    }else{
      arr.push(obj);
    }
};


// append a url if it is not already in the urls array
function appendUrl(url, urls) {
    var i = urls.length
        found = false;
    while (i--) {
        if (utils.compareUrl(urls[i], url)) 
          found = true; 
    }
    if (found === false && utils.isUrl(url)) 
      urls.push(url);
};


// single level property get and append
function getAppend(path, obj, target, propName){
  var propValue = utils.getNodeVaue(path, obj);
  if(propValue)
    target[propName] = propValue;
}


// single level property get and append
function getFirstItemAppend(path, obj, target, propName){
  var propValue = utils.getNodeVaue(path, obj);
  if(propValue)
    target[propName][0] = propValue;
}


// rates the fullness of a given address
function rateAddress(addr){
    var rating = 0;
    if(addr != undefined){
        if (addr['extended-address']) rating++;          
        if (addr['street-address']) rating++;
        if (addr.locality) rating++;
        if (addr.region) rating++;
        if (addr['postal-code']) rating++;
        if (addr['country-name']) rating++;
    }
    return rating;
}


exports.Pages = Pages;
