var fs = require('fs');
var path = require('path');
var collection = [];


function loadPlugins(dirPath) {

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


loadPlugins( path.join(__dirname, '../plugins') );
exports.collection = collection;
