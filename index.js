'use strict';

// ABTestProxy entry point

var config = require('config')
  , ABTestProxy = require('./lib/abtestproxy')
  , svc = new ABTestProxy(config.get('targetEndpoint'));

svc.listen(process.env.PORT || config.get('proxyPort'));

// ----------------------------------------------------------------------------

