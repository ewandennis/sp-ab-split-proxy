'use strict';

var http = require('http')
  , _ = require('lodash')
  , RESTProxy = require('./restproxy');

function ABTestProxy(targetEndpoint) {
  this.server = http.createServer();
  this.proxy = new RESTProxy(this.server, targetEndpoint, this.transformRequest.bind(this));
}

module.exports = ABTestProxy;


ABTestProxy.prototype.listen = function(port, next) {
  this.server.listen(port, next);
};

ABTestProxy.prototype.close = function(next) {
  this.server.close(next);
};

ABTestProxy.prototype.transformRequest = function(req) {
  // Is this an A/B test request?
  // Passthru transmission requests unscathed
  if ('subrequests' in req) {
    var subrequests = req.subrequests
      , subreqlst
      , subreq;

    // Select a request by weight
    subreqlst = this.selectRequestByWeight(subrequests);
    subreq = subreqlst[0];

    // Exclude the 'subrequests' key now that we've consumed it
    delete req.subrequests;

    // Build a new transmission request from the base request
    // and overlay the selected request
    delete subreq.weight;
    req = this.deepExtend(req, subreq);
  }

  // pass through
  return req;
};

// ----------------------------------------------------------------------------

// Given [{weight: <real>}, {weight: <real>}, ...]
// Select an array element at random using the weights as partition values.
// TODO: the naive implementation actually uses the distance between successive weights
ABTestProxy.prototype.selectRequestByWeight = function(requests) {
  var sample = Math.random()
    , sortedreqs = requests.sort(function(a, b) { return a.weight - b.weight; })
    , tide = 0
    , idx;

  for (idx = 0; idx < sortedreqs.length; ++idx) {
    var req = sortedreqs[idx];
    tide += req.weight;

    if (sample < tide) {
      return [req, sample];
    }
  }

  return [sortedreqs[sortedreqs.length - 1], sample];
};

ABTestProxy.prototype.deepExtend = function(destination, source) {
  return _.merge(destination, source);
};

// ----------------------------------------------------------------------------
