
// these filter objects are use to exclude know errors in microformats mark-up

var filters = [
	/*	Not needed with lanyrd plugin
	{
		"domain" : "lanyrd.com",
		"hCardBlockList" : ["title","url"]
	}
	*/
	{
		"domain" : "soundcloud.com",
		"hCardBlockList" : ["email"]
	}
]

exports.filters = filters;