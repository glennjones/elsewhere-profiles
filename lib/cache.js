var options = require('./options.js');
    cache = {};


function get (url) {
  return cache[url].data;
}

function has(url) {
  return cache[url] !== undefined;
}

function fetch (url, callback) {
  callback(null, cache[url].data);
}

function set (url, data) {
  return cache[url] = {
    time:new Date().getTime(),
    data:data
  };
}

function checkLimits () {
  var time = new Date().getTime(),
      i;
  // remove out of date items
  for (i in cache) {
    if ((time - cache[i].time) > options.cacheTimeLimit) {
      delete cache[i];
    }
  }

  // remove some items if over size limit
  // this needs to be reworked to remove on first in first out
  if(size(cache) > options.cacheItemLimit){
    var x = 0;
    for (i in cache) {
      if (x > itemLimit) {
        delete cache[i];
      }
      x ++;
    }
  }

  setTimeout(checkLimits, 10000);
}


// Return the number of elements in an object.
function size (obj) {
    return (obj.length === +obj.length) ? obj.length : keys(obj).length;
}

function keys (obj) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj) if (hasKey(obj, key)) keys[keys.length] = key;
  return keys;
};

function hasKey(obj, key) {
  return hasOwnProperty.call(obj, key);
};


checkLimits();

exports.get = get;
exports.has = has;
exports.set = set;
exports.fetch = fetch;