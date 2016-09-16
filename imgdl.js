var util = require('util');
var fs = require('fs');
var http = require('http');
var https = require('https');
var headers = {'Authorization': 'Client-ID 825022f85f02219'};
var q = require('q');
var opts = {
    hostname: 'api.imgur.com',
    protocol: 'https:',
    method: 'GET',
    headers: headers
}
var outputDir = './download';

if (process.argv.length != 3) {
    console.log('Usage:  nodejs imgdl.js <albumid>');
    process.exit(1);
}

var albumid = process.argv[2];
opts.path = '/3/album/' + albumid;

getImgurMetadata(opts).then(function(data) {
    var arr = data.data.images.map(function(obj) {
        return obj.link;
    });
    for (var i = 0; i < arr.length; i++) {
        var filename = arr[i].substr(arr[i].lastIndexOf('/') + 1);
        download_file(arr[i], filename);
    }
}).catch(function(e) {
    console.log(e);
});

function download_file(fileurl, filename) {
    var imgpath =  outputDir + '/' + filename;
    if (!fs.existsSync(outputDir)) {
        console.log('Creating ' + outputDir);
        fs.mkdir(outputDir);
    }
    var file = fs.createWriteStream(imgpath);
    var filereq = http.get(fileurl, function(res) {
        res.pipe(file).on('finish', function() { console.log('Downloaded ' + fileurl)});
    });
}

function getImgurMetadata(opts) {
    var defer = q.defer();
    var bytes = [];

    https.get(opts, function(res) {
        res.on('data', function(data) {
            bytes.push(data);
        });

        res.on('end', function() {
            return defer.resolve(JSON.parse(bytes.join('').toString()));
        });

        res.on('error', function(err) {
            console.dir(err);
            return defer.reject(err);
        }); 
    });

    return defer.promise;
}