var fs = require('fs');
var path = require('path');
var collection = [];


// load any file that is found in the plugins directory
function load(dirPath) {

    findFiles(dirPath, function(filePath){
        collection.push( require(filePath) );
    })

    function findFiles(dirPath, callback){
        fs.readdir(dirPath, function(err, files) {
            files.forEach(function(file){
                fs.stat(dirPath + '/' + file, function(err, stats) {
                    if(stats.isFile()) {
                        callback(dirPath + '/' + file);
                    }
                    if(stats.isDirectory()) {
                        getDirectoryFiles(dirPath + '/' + file, callback);
                    }
                });
            });
        });
    }
}

// add an plugin directly
function add(interface){
    var i = arr.collection,
        found = false;
    while (i--) {
        if(interface.name === collection[i].name){
            found = true;
        }
    }
    if(!found){ collection.push( interface ) };
}

// start load as server spins up
load( path.join(__dirname, '../plugins') );


exports.collection = collection;
