var request     = require('request'),
	httpCodes   = require('../lib/httpstatus.json'),
    utils       = require('../lib/utilities.js');


/*
	Plugin to use the gravatar.com JSON endpoint
*/
exports.plugin = {
	name: 		'gravatar',
	domains: 	['gravatar.com','en.gravatar.com'],
	version: 	'0.0.1',



	getProfile: function(url, sgn, options, callback) {
		var parts = [], 
			userName = '',
			identity = {},
			www = true,
			urlTemplates = ["http://gravatar.com/{username}",
							"http://gravatar.com/{username}", 
							"http://en.gravatar.com/{username}"];

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
			var url = 'http://en.gravatar.com/' + identity.userName + '.json',
				startedRequest = new Date(),
				requestObj = {
					uri: url,
					headers: options.httpHeaders
				}

			// if url is in the cache use that
			if(cache && cache.has(url)){
				logger.info('using cache for gravatar API data');
		        callback(parse(cache.get(url)));
		    }else{
		    	// if not get the json from the api url  
				request(requestObj, function(requestErrors, response, body){
		          	if(!requestErrors && response.statusCode === 200){
		            	var data = JSON.parse(body)
		            	var out = parse(data);

		            	// add to cache store
			            if(cache){
			              cache.set(url, data);
			            }

						var endedRequest = new Date();
	            		var requestTime = endedRequest.getTime() - startedRequest.getTime();
	            		options.logger.log('made API call to: '  + requestTime + 'ms - ' + url);

		            	callback(out);

		          	}else{
		          		options.logger.warn('error requesting gravatar API: ' + url);
	            		callback({});
		          	}
		        });
			}
		}


		// turn api json into ufData object
		function parse(data){
			var out = {};
     		if(data.entry){

	    		var entry = data.entry[0];
	    		
	    		// map data into ufData format from api json

	        	if(utils.getNodeVaue('name.givenName', entry) !== ''){
	        		if(!out.n) {out.n = {}};
	        		out.n['given-name'] = utils.getNodeVaue('name.givenName', entry)
	        	}	

	        	if(utils.getNodeVaue('name.familyName', entry) !== ''){
	        		if(!out.n) {out.n = {}};
	        		out.n['family-name'] = utils.getNodeVaue('name.familyName', entry)
	        	}	

	        	if(utils.getNodeVaue('name.formatted', entry) !== ''){
	        		out.fn = utils.getNodeVaue('name.formatted', entry)
	        	}	

	        	if(entry.thumbnailUrl){
	        		out.photo = [entry.thumbnailUrl]
	        	}

	        	if(entry.aboutMe){
	        		out.note = [entry.aboutMe]
	        	}

	        	if(entry.urls){
	        		if(!out.url) {out.url = []};
	        		var i = entry.urls.length;
					var x = 0;
					while (x < i) {
					    out.url.push(entry.urls[x].value);
					    x++;
					}
				}

				if(entry.phoneNumbers){
	        		if(!out.tel) {out.tel = []};
	        		var i = entry.phoneNumbers.length;
					var x = 0;
					while (x < i) {
						if(entry.phoneNumbers[x].type === 'mobile'){
							entry.phoneNumbers[x].type = 'cell'
						}
					    out.tel.push(entry.phoneNumbers[x]);
					    x++;
					}
				}

				if(entry.emails){
	        		if(!out.email) {out.email = []};
	        		var i = entry.emails.length;
					var x = 0;
					while (x < i) {
						if(entry.emails[x].primary && entry.emails[x].primary == 'true'){
							entry.emails[x].type = 'pref';
							delete entry.emails[x].primary;
						}
					    out.email.push(entry.emails[x]);
					    x++;
					}
				}
			}
			return {type: ['h-card'], properties: out};
		}



	}

}





