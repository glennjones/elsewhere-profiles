var urlParser    = require('url');

// helper functions
exports.trim = trim;
exports.isString = isString;
exports.isUrl = isUrl
exports.isEmail = isString;
exports.hasProperties = hasProperties;
exports.endsWith = endsWith;
exports.compareUrl = compareUrl;
exports.getNodeVaue = getNodeVaue;
exports.getIdentity = getIdentity;
exports.clone = clone;
exports.isFunction = isFunction;


function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

// simple clone function for json output creation
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// a helper function, finds a property value of a given object literal 
function getNodeVaue(path, obj) {
    // Gets a value from a JSON object
    // vcard[0].url[0]
    var output = null;
    try {
        var arrayDots = path.split(".");
        for (var i = 0; i < arrayDots.length; i++) {
            if (arrayDots[i].indexOf('[') > -1) {
                // Reconstructs and adds access to array of objects
                var arrayAB = arrayDots[i].split("[");
                var arrayName = arrayAB[0];
                var arrayPosition = Number(arrayAB[1].substring(0, arrayAB[1].length - 1));

                if (obj[arrayName] != null || obj[arrayName] != 'undefined') {
                    if (obj[arrayName][arrayPosition] != null || obj[arrayName][arrayPosition] != 'undefined')
                        obj = obj[arrayName][arrayPosition];

                }
                else {
                    currentObject = null;
                }

            }
            else {
                // Adds access to a property using property array ["given-name"]
                if (obj[arrayDots[i]] != null || obj[arrayDots[i]] != 'undefined')
                  obj = obj[arrayDots[i]];
            }
        }
        output = obj;
    } catch (err) {
        // Add error capture
        output = null;
    }
    return output;
}


// find the sgn and builds the identity object
function getIdentity(urlStr, urlTemplates, www) {
     var identity = {};

     urlObj = urlParser.parse(urlStr);
        
     // Loop all the urlMappings for site object
     for(var y = 0; y <= urlTemplates.length-1; y++){
        urlTemplate = urlTemplates[y];

        // remove http protocol    
        urlTemplate = removeHttpHttps(urlTemplate);
        
        // if the urlTemplate contains a username or userid parse it
        if (urlTemplate != '' && (urlTemplate.indexOf('{username}') > -1 || urlTemplate.indexOf('{userid}') > -1)) {
            
            // break up url template
            var parts = urlTemplate.split(/\{userid\}|\{username\}/),
                startMatch = false,
                endMatch = false,
                user = urlObj.href

            // remove protocol, querystring and fragment
            user = user.replace(urlObj.hash, '');
            user = user.replace(urlObj.search, ''); 
            user = removeHttpHttps(user); 
            

            // remove www if subdomain is optional
            if(www){
                user = user.replace('www.', '') ;
                urlStr = urlStr.replace('www.', '') ;
            }

            // remove any trailing /
            if (endsWith(user,'/'))
                user = user.substring(0, user.length - 1); 
              

            // remove unwanted front section of url string
            if (user.indexOf(parts[0]) === 0){
                startMatch = true;
                part = parts[0];
                user = user.substring(part.length, user.length);
            }
            
            // remove unwanted end section of url string
            if (parts.length === 2){
                // if no end part or its just and trailing /
                if (parts[1].length > 0 && parts[1] !== '/'){
                    // end part matches template
                    if (endsWith(user,parts[1])){
                        endMatch = true;
                        user = user.replace(parts[1], '');
                    } else if (endsWith(user,parts[1] + '/')) {
                        // end part matches template with a trailing /
                        endMatch = true;
                        user = user.replace(parts[1] + '/', '');
                    }
                } else {
                    endMatch = true;
                }
            }
            


            // if the user contain anymore / then do not use it
            if (user.indexOf("/") > -1)
                endMatch = false;


            if (startMatch && endMatch){
                
                identity = {}; 
                identity.domain = urlObj.host; 
                identity.matchedUrl = urlStr;

                if (urlTemplate.indexOf("{username}") > -1){
                    identity.userName = user;
                    identity.sgn = "sgn://" + urlObj.host + "/?ident=" + user;
                }

                if (urlTemplate.indexOf("{userid}") > -1){
                    identity.userId = user;
                    identity.sgn = "sgn://" + urlObj.host + "/?pk=" + user;
                }

                break;
            }                       
        } 
    } 

    return identity;
} 


function removeHttpHttps(urlStr){
    return urlStr.replace('http://','').replace('https://','');
}

// compares urls for match
// ie www.twitter.com/glennjones = twitter.com/GlennJones/ 
function compareUrl(urlA, urlB) {
  var same = false;
  
  // Remove url fragments
  if( urlA.indexOf('#') > -1)
      urlA = urlA.split('#')[0];
 
  if( urlB.indexOf('#') > -1)
      urlB = urlB.split('#')[0];
  
  if(urlA != '' || urlB != ''){
      //Remove common subdomain
      urlA = urlA.toLowerCase().replace('www.','');
      urlB = urlB.toLowerCase().replace('www.','');
      
      // Make sure anything ends with / 
      if( endsWith(urlA,'/') == false)
          urlA = urlA + '/';
          
      if( endsWith(urlB,'/') == false)
          urlB = urlB + '/';    
          
      // Look for full match
      if(urlA.toLowerCase() == urlB.toLowerCase())
          same = true;
     
  }
  return same;
};


// simple endsWith function. Use with care
function endsWith(str,test){
  var lastIndex = str.lastIndexOf(test);
  return (lastIndex != -1) && (lastIndex + test.length == str.length);
};


// simple function to find out if a object has properties. 
function hasProperties (obj) {
  for (var key in obj) {
    if(obj.hasOwnProperty(key)){
      return true;
    }
  }
  return false;
}


// is an object a email address
function isEmail(obj) {
    if(isString(obj)){
        return obj.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/ig);
    }else{
        return false;
    }
};


// is an object a URL - very simple version
function isUrl (obj) {
    if(isString(obj)){
        if((obj.indexOf('http://') > -1 || obj.indexOf('https://') > -1) 
        	&& obj.indexOf('.') > -1)
        	return true
        else
        	return false
    }else{
        return false;
    }
};

// is an object a string
function isString(obj) {
    return typeof (obj) == 'string';
};


function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
};



