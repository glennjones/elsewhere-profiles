
// helper functions
exports.trim = trim;
exports.isString = isString;
exports.isUrl = isUrl
exports.isEmail = isString;
exports.hasProperties = hasProperties;
exports.endsWith = endsWith;
exports.compareUrl = compareUrl;
exports.getNodeVaue = getNodeVaue;


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


// simple function to find out if a object has properties. Use with care
function hasProperties (obj) {
    for (var i in obj) {
        return true;
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



