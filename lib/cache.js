var cacheItemLimit = 1000,
    cacheTimeLimit = 3600000,  // 3600000 = 1hr,
    logger = {},
    cache   = [];


function setCacheLimits(newCacheTimeLimit, newCacheItemLimit, alogger){
  cacheTimeLimit = newCacheTimeLimit;
  cacheItemLimit = newCacheItemLimit;
  logger = alogger;
}


function get (url) {
  var i = cache.length;
  var x = 0;
  while (x < i) {
    if(url === cache[x].url){
      return cache[x].data;
    }
    x++;
  }
  return undefined;
}


function has(url) {
  return (get(url) === undefined)? false : true;
}


function fetch (url, callback) {
  callback(null, get(url));
}


function set (url, data) {
  if(cache.length >= cacheItemLimit){
    cache.pop();
  }
  return cache.unshift( {
    url : url,
    time : new Date().getTime(),
    data : data
  });
}


function checkLimits () {
  var time = new Date().getTime(),
      i,
      x =0,
      out =[];

  i = cache.length;
  while (x < i) {
      if ((time - cache[x].time) < cacheTimeLimit) {
          out.unshift(cache[x])
      }
      x++;
  }
  cache = out;

  setTimeout(checkLimits, 10000);
}

checkLimits ();


exports.get = get;
exports.has = has;
exports.set = set;
exports.fetch = fetch;
exports.setCacheLimits = setCacheLimits;