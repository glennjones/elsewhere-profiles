var request     = require('request'),
	httpCodes   = require('../lib/httpstatus.json'),
    utils       = require('../lib/utilities.js');


/*
	Plugin to use the github.com JSON endpoint
*/
exports.plugin = {
	name: 		'github',
	domains: 	['github.com'],
	version: 	'0.0.1',



	getProfile: function(url, sgn, logger, cache, options, callback) {
		var parts = [], 
			userName = '',
			identity = {},
			www = true,
			urlTemplates = ["http://github.com/{username}"];

		// find username from url or sgn
		identity.userName = '';
		if(!sgn){
			identity = utils.getIdentity(url, urlTemplates, www);
		}else{
			if(sgn.indexOf('?ident=') > 0){
				parts = sgn.split('=');
				identity.userName = parts[1];
			}
		}

		// if we have a username get profile data
		if(identity.userName !== ''){
			var url = 'https://api.github.com/users/' + identity.userName,
				requestObj = {
					uri: url,
					headers: options.httpHeaders
				}

			// if url is in the cache use that
			if(cache && cache.has(url)){
				logger.info('using cache for github API data');
		        callback(parse(cache.get(url)));
		    }else{
		     	// if not get the json from the api url  
				request(requestObj, function(requestErrors, response, body){
					logger.info('getting github API data from url');
		          	if(!requestErrors && response.statusCode === 200){
		            	var data = JSON.parse(body)
		            	var out = parse(data);

		            	// add to cache store
			            if(cache){
			              cache.set(url, data);
			            }

		            	callback(out);
		          	}else{
		          		logger.warn('error requesting page: ' + url);
	            		callback({});
		          	}
		        });
			}
		}


		// turn api json into ufData object
		function parse(data){
			var out = {};
        	if(data.type && data.type === 'User'){

        		// map data into ufData format from api json
        		if(data.name !== '') {out.fn = data.name};
        		if(data.username !== '') {out.nickname = data.username};
        		if(data.blog !== '') {
        			if(!out.url) {out.url =[]}
        			out.url.push(data.blog);
        		};
        		if(data.html_url !== '') {
        			if(!out.url) {out.url =[]}
        			out.url.push(data.html_url);
        		};
        		if(data.bio !== null) {out.note = [data.bio]};
        		if(data.location !== '') {out.label = [data.location]};
				if(data.company !== '') {
					out.org = [];
					out.org.push({'organization-name' : data.company})
				};
				if(data.avatar_url !== '') {out.photo = [data.avatar_url]}; 
				if(data.email !== '') {
					out.email = [];
					out.email.push({'value' : data.email})
				};
        		
			}
			return out;
		}

	}
}





