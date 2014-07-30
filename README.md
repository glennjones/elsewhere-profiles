# elsewhere-profiles

The elsewhere-profiles is a Social media profile aggregator, it is part of a collection of node.js modules that enable the discovery of profiles and identities an indivdaul creates across the web.


## Install

    npm install elsewhere-profiles

or

    git clone http://github.com/glennjones/elsewhere-profiles.git
    cd elsewhere-profiles
    npm link


#### Use

with list of URLs

    var parser = require("elsewhere-profiles");

    parser.parseUrls('http://glennjones.net/about', function(data){
        // do something with data
    });


with JSON from [elsewhere-mapper module](https://github.com/glennjones/elsewhere-mapper "elsewhere-mapper node.js module")

    var parser = require("elsewhere-profiles");

    parser.parseElsewhereJson({ data object... },  function(data){
        // do something with data
    });


#### Options and internal cache

    var parser = require("elsewhere-profiles");
    var options = {'cacheTimeLimit': 360000}

    parser.parseUrls('http://glennjones.net/about', options, function(data){
        // do something with data
    });

Elsewhere use an in memory cache for the html it has fetched from web pages during its operation. The options object contains a property called cacheTimeLimit which can be use to set the refresh gap, by default it is set 360000ms equal to 1 hour. 

You can also replace the cache with your own functionally if you provide an object contain the following interface:

  {
    function get (url) {
      returns data
    }

    function has(url) {
      returns true || false
    }

    function fetch (url, callback) {
      fires callback(null, data);
    }

    function set(url, data) {
      returns object
    }

  }

Add the object to the options.cache property



#### Response 

This will return JSON. This is an example where three urls where given:
http://www.flickr.com/people/glennjonesnet/,
http://www.linkedin.com/in/glennjones,
http://upcoming.yahoo.com/user/62673/

    { 
        "profiles": [{
            "profile": {
                "type": ["h-card"],
                "properties":{
                    "adr": [{
                        "locality": "Brighton",
                        "country-name": "United Kingdom"
                    }],
                    "note": ["Glenn Jones is a director and a founder of Madgex. Equally as passionate about interaction design and coding, he is currently addicted to exploring ideas of the semantic web and data portability."],
                    "url": ["http://www.glennjones.net"]
                }
            },
            "identity": {
                "name": "Flickr",
                "domain": "flickr.com",
                "matchedUrl": "http://www.flickr.com/people/glennjonesnet/",
                "userName": "glennjonesnet",
                "sgn": "sgn://flickr.com/?ident=glennjonesnet",
                "endPoints": [{
                    "schema": "hCard",
                    "contentType": "Profile",
                    "mediaType": "Html",
                    "url": "http://flickr.com/people/glennjonesnet/"
                }, {
                    "schema": "None",
                    "contentType": "Images",
                    "mediaType": "Html",
                    "url": "http://flickr.com/photos/glennjonesnet/"
                }],
                "frequency": 0,
                "icon16": "http://l.yimg.com/g/favicon.ico"
            }
        }, {
            "profile": {
                "type": ["h-card"],
                "properties":{
                    "adr": [{
                        "locality": "Brighton, United Kingdom"
                    }],
                    "fn": "Glenn Jones",
                    "n": {
                        "given-name": ["Glenn"],
                        "family-name": ["Jones"]
                    },
                    "photo": ["http://m3.licdn.com/mpr/pub/image-gHqDu1tz7mTBl71NNV7WML3hcO_1GoUWgH-d6cqcc_u1-ekTgHqd9Kozc4DJGoTXS4Iw/glenn-jones.jpg"],
                    "title": ["Creative Director at Madgex and Owner, Madgex"],
                    "note": "Madgex"
                }
            },
            "identity": {
                "name": "Linked-in",
                "domain": "linkedin.com",
                "matchedUrl": "http://www.linkedin.com/in/glennjones",
                "userName": "glennjones",
                "sgn": "sgn://linkedin.com/?ident=glennjones",
                "endPoints": [{
                    "schema": "hCard",
                    "contentType": "Profile",
                    "mediaType": "Html",
                    "url": "http://linkedin.com/in/glennjones"
                }, {
                    "schema": "hResume",
                    "contentType": "Resume",
                    "mediaType": "Html",
                    "url": "http://linkedin.com/in/glennjones"
                }],
                "frequency": 5,
                "icon16": "http://s3.licdn.com/scds/common/u/img/favicon_v3.ico"
            }
        }],
        "combinedProfile": {
            "type": ["h-card"],
                "properties":{
                "adr": [{
                    "locality": "Brighton",
                    "country-name": "United Kingdom"
                }],
                "url": ["http://www.glennjones.net"],
                "note": ["Glenn Jones is a Director and founder of Madgex. Equally as passionate about interaction design and coding, he is currently addicted to exploring ideas of the semantic web and data portability. <br />"],
                "fn": "Glenn Jones",
                "nickname": ["glennjones"],
                "n": {
                    "given-name": ["Glenn"],
                    "family-name": ["Jones"]
                },
                "photo": ["http://m3.licdn.com/mpr/pub/image-gHqDu1tz7mTBl71NNV7WML3hcO_1GoUWgH-d6cqcc_u1-ekTgHqd9Kozc4DJGoTXS4Iw/glenn-jones.jpg"],
                "title": ["Creative Director at Madgex and Owner, Madgex"]
                ],
                "username": "glennjones",
                "highestFrequencySite": "http://glennjones.net/",
                "accounts": [ {
                    "name": "Flickr",
                    "domain": "flickr.com",
                    "profileUrl": "http://flickr.com/people/glennjonesnet/",
                    "userName": "glennjonesnet",
                    "sgn": "sgn://flickr.com/?ident=glennjonesnet",
                    "icon16": "http://l.yimg.com/g/favicon.ico",
                    "frequency": 0
                }, {
                    "name": "Linked-in",
                    "domain": "linkedin.com",
                    "profileUrl": "http://linkedin.com/in/glennjones",
                    "userName": "glennjones",
                    "sgn": "sgn://linkedin.com/?ident=glennjones",
                    "icon16": "http://s3.licdn.com/scds/common/u/img/favicon_v3.ico",
                    "frequency": 5
                },]
            }
        },
        "noProfilesFound": [ {
            "name": "Upcoming",
            "domain": "upcoming.yahoo.com",
            "matchedUrl": "http://upcoming.yahoo.com/user/62673/",
            "userId": "62673",
            "sgn": "sgn://upcoming.yahoo.com/?pk=62673",
            "endPoints": [{
                "schema": "hCard",
                "contentType": "Profile",
                "mediaType": "Html",
                "url": "http://upcoming.yahoo.com/user/62673/"
            }],
            "frequency": 3,
            "icon16": "http://upcoming.yahoo.com/favicon.ico"
        }]
    }



#### Using the server API  

Once you've cloned the project and run *npm install*, run the server *$ node bin/elsewhere-profiles* and then point your browser at localhost:8882 to try it out.  

The server API will takes a comma delimited list of URLs. Alternatively you can also pass it a JSON string from the output of the elsewhere-mapper node.js module. Finally it supports a callback querystring item for use with any of the other three data types.


    GET http://localhost:8882/?urls=http%3A%2F%2Ftwitter.com%2Fglennjones&callback=myFunction



## Contributing to the project 

Please use github to ask me to pull your additions or corrections. 


## Support or Contact

Having trouble with elsewhere-profiles? Please raise an issue at: https://github.com/glennjones/elsewhere-profiles/issues


## License

The project is open sourced under MIT licenses. See the license.txt file within the project source.
