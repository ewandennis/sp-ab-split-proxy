var http = require('http')
  , ABTestProxy = require('./lib/abtestproxy')
  , PROXY_PORT = 8000
  , SERVER_PORT = 9000

var cxt = {};

cxt.proxy = new ABTestProxy('http://127.0.0.1:' + SERVER_PORT + '/');

cxt.server = http.createServer(function(req, res) {
  var reqcontent = '';

  req.on('data', function(chunk) {
    reqcontent += chunk;
  });

  req.on('end', function() {
    res.writeHead(200, { 'Content-Type': 'application/json'});
    res.write(JSON.stringify({msg:'ok', path: req.url}));
    res.end();
  });
});

cxt.server.listen(SERVER_PORT);
cxt.proxy.listen(PROXY_PORT);

var req = http.request({
  hostname: 'localhost',
  port: PROXY_PORT,
  method:'POST',
  path: '/'
}, function(res) {
  console.log('woooo');
  done();
}).on('error', function(e) {
  console.log('Error: ' + e.message);
  done();
});

req.write(JSON.stringify({msg:'really ok', path: req.url}));
req.end();

function done() {
  console.log('wtf');
  cxt.proxy.close();
  cxt.server.close();
}
