
// these filter objects are use to exclude know errors in mark-up

var filters = [
	{
		"domain" : "lanyrd.com",
		"hCardBlockList" : ["title","url"]
	}
]

exports.filters = filters;