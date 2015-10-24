var _ = require('lodash');

a = {
  bob: {
    jim: 101
  },
  sue: 1
};

b = {
  bob: {
    fred: 202
  },
  sue: 2
};


m = _.merge(a, b);

console.log(JSON.stringify(m, null, '  '));
