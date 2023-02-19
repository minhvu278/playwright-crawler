var fs = require('fs'),
    http = require('http'),
    https = require('https');

var Stream = require('stream').Transform;

export const downloadImageToUrl = async (url, filename) => {
    return new Promise((ok, fail) => {
        var client = http;
        if (url.toString().indexOf("https") === 0) {
            console.log('Client now is https');
            client = https;
        }

        console.log(url);

        client.request(url, function (response) {
            var data = new Stream();

            response.on('data', function (chunk) {
                console.log('On data chunk');
                data.push(chunk);
            });

            response.on('end', function () {
                console.log('On end');
                fs.writeFileSync(filename, data.read());
                ok(true);
            });
        }).end();
    })

};