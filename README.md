# elsewhere-profiles

The elsewhere-profiles is a social media profile endpoint mapper, it is part of a collection of node.js modules that enable the discovery of profiles and identities an indivdaul creates across the web.


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


#### Response 

This will return JSON. This is an example where three urls where given:
http://www.flickr.com/people/glennjonesnet/,
http://identi.ca/glennjones,
http://www.last.fm/user/glennjones

    {
        "urls": ["http://www.flickr.com/people/glennjonesnet/", "http://identi.ca/glennjones", "http://www.last.fm/user/glennjones"],
        "profiles": [{
            "adr": [{
                "locality": "Brighton",
                "country-name": "United Kingdom"
            }],
            "note": ["Glenn Jones is a director and a founder of Madgex. Equally as passionate about interaction design and coding, he is currently addicted to exploring ideas of the semantic web and data portability."],
            "url": ["http://www.glennjones.net"],
            "profile-origin": "http://www.flickr.com/people/glennjonesnet/"
        }, {
            "fn": "Glenn Jones",
            "n": {
                "given-name": ["Glenn"],
                "family-name": ["Jones"]
            },
            "photo": ["http://avatar3.status.net/i/identica/39450-48-20090211233434.jpeg"],
            "url": ["http://identi.ca/glennjones"],
            "profile-origin": "http://identi.ca/glennjones"
        }, {
            "adr": [{
                "country-name": "United Kingdom"
            }],
            "fn": "Glenn Jones",
            "n": {
                "given-name": ["Glenn"],
                "family-name": ["Jones"]
            },
            "photo": ["http://userserve-ak.last.fm/serve/126/24979097.jpg"],
            "url": ["http://www.glennjones.net"],
            "profile-origin": "http://www.last.fm/user/glennjones"
        }],
        "noProfileFound": [],
        "combinedProfile": {
            "adr": [{
                "locality": "Brighton",
                "country-name": "United Kingdom"
            }],
            "url": ["http://www.glennjones.net", "http://identi.ca/glennjones"],
            "note": ["Glenn Jones is a director and a founder of Madgex. Equally as passionate about interaction design and coding, he is currently addicted to exploring ideas of the semantic web and data portability."],
            "n": {
                "given-name": ["Glenn"],
                "family-name": ["Jones"]
            },
            "fn": "Glenn Jones",
            "photo": ["http://userserve-ak.last.fm/serve/126/24979097.jpg"]
        }
    }



#### Using the server API  

Once you've cloned the project and run *npm install*, run the server *$ node bin/elsewhere-profiles* and then point your browser at localhost:8881 to try it out.  

The server API will takes a comma delimited list of URLs. Alternatively you can also pass it a JSON string from the output of the elsewhere-mapper node.js module. Finally it supports a callback querystring item for use with any of the other three data types.


    GET http://localhost:8881/?urls=http%3A%2F%2Ftwitter.com%2Fglennjones&callback=myFunction



## Contributing to the project 

Please use github to ask me to pull your additions or corrections. 


## Support or Contact

Having trouble with elsewhere-profiles? Please raise an issue at: https://github.com/glennjones/elsewhere-profiles/issues


## License

The project is open sourced under MIT licenses. See the license.txt file within the project source.
