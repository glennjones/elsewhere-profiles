var url = require('url'),
	filters = require('./filters.js').filters,
	utils = require('./utilities.js');


/**
 * Profile object
 */
function Profile (url) {
	this.url = url;
	this.representativehCard = {};
	this.hCards = [];
	this.hResumes = [];
	this.xfn = [];
	this.identity = {};
}


Profile.prototype = {

	constructor: Profile,

	// using representative hCard parsing rules to find the right hCard
	findRepresentativehCard: function(urls){
   

		if(this.hCards.length > -1){

			// remove all organisational hCards using fn = org.organization-name pattern
        	var i = this.hCards.length;
			while (i--) {
				if(this.hCards[i].org && this.hCards[i].org[0]['organization-name']){
	            	if( this.hCards[i].fn === this.hCards[i].org[0]['organization-name'] ){
	            		this.hCards.splice(i,1);
	            	}
            	}
			}


			// if there is only one hcard use that
		    if(this.hCards.length === 1){
		        this.representativehCard = this.hCards[0];
		    }else{
				i = this.hCards.length;
				var x = 0;
				while (x < i) {
				    var hcard = this.hCards[x];
				    if(hcard.url){
				    	// match the urls of the hcard to the known urls
						for (var y = 0; y < urls.length; y++) {
							for (var z = 0; z < hcard.url.length; z++) {
						    	if( utils.compareUrl(urls[y], hcard.url[z]) ){
						    		this.representativehCard = hcard;
						    	}
							}
						}
				    	// match the xfn urls of the page to hcard urls
						if(this.xfn.length > -1){
							for (var z = 0; z < this.xfn.length; z++) {
								for (var y = 0; y < hcard.url.length; y++) {
							    	if( this.xfn[z].link !== undefined 
							    		&& this.xfn[z].rel !== undefined
							    		&& utils.compareUrl(hcard.url[y], this.xfn[z].link) 
							    		&& this.xfn[z].rel === 'me'){
							    		this.representativehCard = hcard;
							    	}
								}
							}
						}
				    }
				    x++;
				}
		    }
		}		


	    // if we have a hresume use contact hcard
		if(this.hResumes.length !== 0){
			if(this.hResumes[0].contact){
				this.representativehCard = this.hResumes[0].contact
				// description
				if(this.hResumes[0].summary !== '')  
					this.representativehCard.note = this.hResumes[0].summary;
				// job role

				// org


			}
		}
		this.filterRepresentativehCard();

	},


	// loops through the filter and deletes properties in
	// the block list from the matching domains representative hCard
	filterRepresentativehCard: function(){
		var i = filters.length,
		    x = 0,
		    urlObj = url.parse(this.url, parseQueryString=false);

		while (x < i) {
			if(filters[x].domain === urlObj.hostname){
				for (var y = 0; y < filters[x].hCardBlockList.length; y++) {
					delete this.representativehCard.properties[filters[x].hCardBlockList[y]];
				}
			}
			x++;
		}
	},

	toJson: function(){
		return {
			'profile': this.representativehCard,
			'identity': this.identity
		}
		 
	}





};


exports.Profile = Profile;