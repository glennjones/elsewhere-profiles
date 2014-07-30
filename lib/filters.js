
// these filter objects are use to exclude know errors in microformats mark-up

var filters = [
	{
		"domain" : "soundcloud.com",
		"hCardBlockList" : ["email"]
	},
	{
		"domain" : "plus.google.com",
		"hCardBlockList" : ["name"]
	},
	{
		"domain" : "www.flickr.com",
		"hCardBlockList" : ["name"]
	}
]

exports.filters = filters;