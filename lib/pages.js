var Page = require('./page.js').Page,
    utils = require('./utilities.js');


/**
 * Pages object
 */
function Pages (urls, identities, callback){
  this.urls = urls;
  this.pageCollection = [];
  this.completed = 0;
  // turn array of urls into an array of page objects
    var i = urls.length,
        x = 0;
    while (x < i) {
      this.pageCollection.push(new Page(urls[x]))
      x++;
  }

  this.fetch(callback);
}


Pages.prototype = {
  constructor: Pages,

  // have all the urls been loaded and parsed
  isComplete: function(){
    return (this.completed === this.pageCollection.length)
  },

  // fetch all the pages
  fetch: function(callback){
    var self = this,
      i = this.pageCollection.length,
      x = 0;

    // this is called once a page is fully parsed
    pageHasParsed = function(page){
      self.completed ++;

      console.log(self.completed + ' - ' + self.pageCollection.length)

      if(self.isComplete() && callback){
        // if all pages are parsed
        callback(self);
      }    
    }

    while (x < i) {
      this.pageCollection[x].fetch(pageHasParsed);
      x++;
    }

  }
}


// converts the data structure into a compact version for output
function postProcess (pages){
  var coll = pages.pageCollection,
      i = coll.length,
      x = 0;

  pages.profiles = [];
  pages.noProfileFound = [];

  while (x < i) {
      coll[x].profile.findRepresentativehCard(pages.urls);

      if(utils.hasProperties(coll[x].profile.representativehCard)){
        coll[x].profile.representativehCard['profile-origin'] = coll[x].url;
        pages.profiles.push(coll[x].profile.representativehCard);
      }else{
        pages.noProfileFound.push(coll[x].url)
      }
      x++;
  }
  pages.combinedProfile = combineProfiles(pages);
  delete pages.pageCollection;
  delete pages.completed;

  return pages;
}



// combines profiles 
function combineProfiles(pages){
  var profiles = pages.profiles,
      i = profiles.length,
      x = 0
      out = {};

  while (x < i) {

    // append the simple single value properties
    var singleProps = ['fn','n','bday','class','geo','rev','role','sort-string','tz','uid'];
    var z = singleProps.length;
    while (z--) {
      getAppend(singleProps[z], profiles[x], out, singleProps[z]);
    }

    // append multiple occurrence properties where only want the first item
    var firstItemProps = ['key','label','logo','mailer','nickname','photo','sound','title', 'org'];
    z = firstItemProps.length;
    while (z--) {
      getAppend(firstItemProps[z], profiles[x], out, firstItemProps[z]);
    }

    // append address with the largest number of elements
    if(profiles[x].adr){
      if(!out.adr ){
        out.adr = [];
        out.adr[0] = profiles[x].adr[0];
      }else{
        if(rateAddress(profiles[x].adr[0]) > rateAddress(out.adr[0]))
          out.adr[0] = profiles[x].adr[0];
      }
    }

    // append urls into a single list
    if(profiles[x].url){
      if(!out.url)
        out.url = [];
      z = profiles[x].url.length;
      while (z--) {
        appendUrl(profiles[x].url[z], out.url);
      }
    }

    // append email address into a single list
    if(profiles[x].email){
      if(!out.email)
        out.email = [];
      z = profiles[x].email.length;
      while (z--) {
        appendValueType(profiles[x].email[z], out.email, 'email');
      }
    }

    // append email address into a single list
    if(profiles[x].tel){
      if(!out.tel)
        out.tel = [];
      z = profiles[x].tel.length;
      while (z--) {
        appendValueType(profiles[x].tel[z], out.tel, 'tel');
      }
    }

    // add the longest note
    if(profiles[x].note){
      if(!out.note){
        out.note = [];
        out.note[0] = profiles[x].note[0];
      }else{
        if(profiles[x].note[0].length > out.note[0].length)
          out.note[0] = profiles[x].note[0];
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
exports.postProcess = postProcess;