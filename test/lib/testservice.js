'use strict';

var http = require('http')
  , ABTestProxy = require('../../lib/abtestproxy')
  , PROXY_PORT = 8000
  , SERVER_PORT = 9000;

function TestService() {
  var self = this;

  // HTTP server that mirrors request bodies as responses
  self.server = http.createServer(function(req, res) {
    var statusCode = req.headers.hasOwnProperty('x-msys-set-status-code') ? req.headers['x-msys-set-status-code'] : 200
      , contentType = req.headers.hasOwnProperty('content-type') ? req.headers['content-type']: 'application/json'

    res.writeHead(statusCode, { 'Content-type': contentType });
    req.pipe(res);
  });

  // Proxy the mirror service
  self.proxy = new ABTestProxy('http://127.0.0.1:' + SERVER_PORT + '/');  
}

TestService.prototype.listen = function(next) {
  var self = this;
  self.server.listen(SERVER_PORT, function() {
    self.proxy.listen(PROXY_PORT, next);
  });
};

TestService.prototype.close = function(next) {
  var self = this;
  self.proxy.close(function() {
    self.server.close(next);
  });
};


/* args: body, [headers], callback */ 
TestService.prototype.sendJSONPostRequest = function(body) {
  var headers = arguments.length > 2 ? arguments[1] : null
    , callback = arguments[arguments.length - 1]
    , req;

  headers = headers || {'content-type': 'application/json'};

  req = http.request({
    hostname: 'localhost',
    port: PROXY_PORT,
    method:'POST',
    path: '/',
    headers: headers
  }, function(resp) {
    callback(null, resp);
  });

  req.on('error', function(err) {
    callback(err);
  });

  req.write(JSON.stringify(body));
  req.end();
};

TestService.prototype.getJSONPostResponse = function(body, callback) {
  this.sendJSONPostRequest(body, function(err, resp) {
    var responsebufs = [];

    if (err) {
      return callback(err);
    }

    resp.on('err', callback);

    resp.on('data', function(chunk) {
      responsebufs.push(chunk);
    });

    resp.on('end', function() {
      var response = JSON.parse(Buffer.concat(responsebufs).toString('utf8'));
      callback(null, response);
    });

  });
};

module.exports = TestService;
