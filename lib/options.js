module.exports = {

  // The level at which to log
  //  error  1
  //  warn   2
  //  info   3
  //  log    4
  logLevel: 3,

  // The amount of time items are keep in the
  // cache for before they are discarded. Time in 
  // milliseconds.
  cacheTimeLimit: 3600000,  // 3600000 = 1hr

  // The number of items to keep in cache before
  // some are discarded. Use to limit memeory use
  cacheItemLimit: 1000

}