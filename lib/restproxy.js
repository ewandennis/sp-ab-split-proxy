'use strict';

// Given a REST request with a JSON body, allow the developer
// to transform the JSON and then forward the request to a
// target URL, passing the target server's response back to the
// client.

var url = require('url')
  , http = require('http');

module.exports = function(server, destHost, reqHandler) {
  var self = this;

  self.server = server;
  self.destHost = url.parse(destHost);

  server.on('request', function(clientreq, clientres) {
    var clientreqchunks = [];

    clientreq.on('data', function(chunk) {
      clientreqchunks.push(chunk);
    });

    clientreq.on('end', function() {
      var bodystr = Buffer.concat(clientreqchunks).toString('utf8')
        , body = JSON.parse(bodystr)
        , transformedbody = reqHandler(body)
        , options
        , targetreq
        , stripHeaders;

      // Clone original request
      options = {
        hostname: self.destHost.hostname,
        port: self.destHost.port ? self.destHost.port : 80,
        path: clientreq.url,
        method: clientreq.method,
        headers: clientreq.headers
      };

      // Strip content-length in case we changed the request body
      // Strip host since its only correct for the proxy
      stripHeaders = ['content-length', 'host'];
      stripHeaders.forEach(function(hdrName) {
        delete options.headers[hdrName];
      });

      // TODO: be a good proxy and add X-Forwarded-[For|By] headers

      // Send HTTP request to target
      targetreq = http.request(options, function(targetres) {

        clientres.writeHead(targetres.statusCode, targetres.headers);
        // Write response to original HTTP client
        targetres.pipe(clientres);

      }); // target response handler

      targetreq.on('error', function(err) {
        throw err;
      });

      // Write transformed body to target
      targetreq.write(JSON.stringify(transformedbody));
      targetreq.end();

    }); // client data request end handler
  }); // client request handler

  server.on('clientError', function(err) {
    throw err;
  });
};

// ----------------------------------------------------------------------------
