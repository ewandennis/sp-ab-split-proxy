var http = require('http');

http.createServer(function (req, res) {
  var reqcontent = '';

  console.log('Request received');

  req.on('data', function(chunk) {
    reqcontent += chunk;
  });

  req.on('end', function() {
		var reqstr = JSON.stringify(JSON.parse(reqcontent), null, 4);
		console.log(reqstr);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Method: ' + req.method + '\n');
    res.write('Headers: ' + JSON.stringify(req.headers, null, 4) + '\n');
    res.write('Request body: ' + reqstr + '\n');
    res.end();
  });

}).listen(8000);
