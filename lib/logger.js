options = require('./options.js');

// Taken from the node.js logging levels
exports.log = log;
exports.info = info;
exports.warn = warn;
exports.error = error;


// logLevel - 4	
// log - the finest logging level. Can be used to log very specific 
// information that is only relevant in a true debugging scenario
function log(msg){
	if(options.logLevel > 3){
		console.log('log: ' + msg);
	}
}


// logLevel - 2
// info - General application flow, such as "Starting app" and "registering ...". 
// in short, information which should help any observer understand what the 
// application is doing in general.
function info(msg){
	if(options.logLevel > 2){
		console.info('info: ' + msg);
	}
}


// logLevel - 2
// warn - warns of errors that can be recovered. Such as failing to 
// parse a date or using an unsafe routine.
function warn(msg){
	if(options.logLevel > 1){
		console.warn('warn: ' + msg);
	}
}


// logLevel - 1
// error - warns of errors that can be recovered. Such as failing to 
// parse a date or using an unsafe routine.
function error(msg){
	if(options.logLevel > 1){
		console.error('error: ' + msg);
	}
}

// logLevel - 0 means no logging

