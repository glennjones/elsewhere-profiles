var request     = require('request'),
	Page        = require('../lib/page.js').Page,
	httpCodes   = require('../lib/httpstatus.json'),
    utils       = require('../lib/utilities.js');


/*
	Plugin to use the lanyrd.js module
*/
exports.plugin = {
	name: 		'lanyrd',
	domains: 	['lanyrd.com'],
	version: 	'0.0.1',


	getProfile: function(url, sgn, options, callback) {
		var parts = [], 
			userName = '',
			identity = {},
			www = false,
			urlTemplates = ["http://lanyrd.com/profile/{username}",
							"http://lanyrd.com/people/{username}"];


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

		fetch(identity, options, callback);



		// fetch both api and microformats data and then mix together
		function fetch(identity, options, callback){
			var completed  = 0
				combinedProfile = {};

		    // this is called once a page is fully parsed
		   	function whenFetched(err, data){
		      completed ++;

		      // combines the api and microformats data into one profile
		      if(data){
			      if(data.fn) {combinedProfile.fn = data.fn};
			      if(data.n) {combinedProfile.n = data.n};
			      if(data.nickname) {combinedProfile.nickname = data.nickname};
				  if(data.photo) {combinedProfile.photo = data.photo};
				  if(data.note) {combinedProfile.note = data.note};
				  // for the moment exclude microformat url structures
				  if(data.url && data.source === 'api') {
				  	if(!combinedProfile.url) {combinedProfile.url = []};
				  	var i = data.url.length;
					while (i--) {
				  		appendUrls(data.url[i], combinedProfile.url);
				  	}
				  };
			  }

			  // once we have both bit of data fire callback
		      if(completed === 2){
		        callback(combinedProfile);
		      }  
		    }

		    // get microformats data
		    getUFData(identity.userName, identity, options, function(err,data){
		    	whenFetched(err, data);
		    });

		    // get api data
		    getAPIData(identity.userName, options, function(err,data){
		    	whenFetched(err, data);
		    });
		 }



		 // appends url if its not already in the array
		 function appendUrls(url, arr){
			var i = arr.length,
				found = false;
			while (i--) {
			    if(arr[i] === url){
			    	found = true;
			    	break;
			    }
			}
			if(!found) arr.push(url);
		 }

		

		// collect microfomats data from the lanyrd site
		function getUFData(userName, identity, options, callback) {
			var url = 'http://lanyrd.com/people/' + userName,
				cache = options.cache,
				page =  new Page(url, identity, null, options);

			page.fetchUrl(function(){
				if(page.profile.hCards.length > 0){
					page.profile.hCards[0].source = 'microformat';	
					callback(null, page.profile.hCards[0]);
				}else{
					callback(null, {});
				}
			})
		}



		// use the lanyrd api to get data
		function getAPIData(userName, options, callback){

			if(process.env.LANYRD_API_URL)
			{
				var url = process.env.LANYRD_API_URL + 'people/' + userName,
					cache = options.cache,
					startedRequest = new Date(),
					requestObj = {
						uri: url,
						headers: options.httpHeaders
					};

				// if url is in the cache use that
				if(cache && cache.has(url)){
					options.logger.info('using cache for lanyrd API data');
			        callback(null, parse(cache.get(url)));
			    }else{
			     	// if not get the json from the api url  
					request(requestObj, function(requestErrors, response, body){
						options.logger.info('getting lanyrd API data from url');
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

			            	callback(null, out);
			          	}else{
		            		callback('error requesting Lanyrd API', {});
			          	}
			        });
				}
			}else{
				callback('LANYRD_API_URL not found', {});
			}
		}


		// turn api json into ufData object
		function parse(data){
			var out = {source: 'api'};
        	if(data.ok && data.ok === true){

        		var entry = data.user;

        		if(entry.username){ out.nickname = entry.username };
        		if(entry.name){ out.fn = entry.name };
				if(entry.short_bio){ out.note = [entry.short_bio] };

        		if(entry.web_url){ 
        			if(!out.url) {out.url = []};
        			out.url.push(entry.web_url);
        		};

        		if(entry.twitter_url){ 
        			if(!out.url) {out.url = []};
        			out.url.push(entry.twitter_url);
        		};

				if(entry.avatar_url){ 
				  	var large = entry.avatar_url.replace('s48','s300');
					out.photo = [large] 
				};

			}
			return {type: ['h-card'], properties: out};
		}
		
	}
}





