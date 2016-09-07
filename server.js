var http = require('http');
var fs = require('fs');

var server = new http.Server();
var homepage = fs.readFileSync('index.html');

server.on('request', function(req, res){
	if(req.url === "/") {
		res.writeHeader(200, {"Content-Type": "text/html"}); 
		res.write(homepage); 
		res.end();
	}
	else {
		var src = req.url;
		src = '.' + src;

		fs.readFile(src, function(err, file) {
			if(err) throw err;

			res.write(file);
			res.end();

		});
	}
});

server.listen('1337', '127.0.0.1');