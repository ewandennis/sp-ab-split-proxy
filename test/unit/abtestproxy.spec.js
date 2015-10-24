'use strict';

var chai = require('chai')
  , _ = require('lodash')
  , TestService = require('../lib/testservice')
  , expect = chai.expect;

function startSvc(next) {
  /*jshint validthis:true */
  this.service = new TestService();
  this.service.listen(next);
}

function stopSvc(next) {
  /*jshint validthis:true */
  this.service.close(next);
}

describe('ABTestProxy', function() {
  beforeEach('Start service', startSvc);
  afterEach('Stop service', stopSvc);

  describe('#selectRequestByWeight', function() {

    it('should apply a single subrequest according to its weight', function(done) {
      var self = this
        , subrequests = [
          {weight: 0.0, msg: 'option 1'},
          {weight: 1.0, msg: 'option 2'}
        ]
        , req1count = 0
        , req2count = 0
        , testcount = 100
        , variance = testcount * 0.2;

      expect(self.service.proxy.selectRequestByWeight(subrequests)[0]).to.equal(subrequests[1]);

      subrequests[0].weight = 0.5;
      subrequests[1].weight = 0.5;
      for (var i = 0; i < testcount; ++i) {
        if (self.service.proxy.selectRequestByWeight(subrequests)[0].msg === 'option 1') {
          ++req1count;
        } else {
          ++req2count;
        }
      }

      expect(req1count + req2count).to.equal(testcount);
      expect(req1count).to.be.closeTo(testcount / 2, variance);
      expect(req2count).to.be.closeTo(testcount / 2, variance);
      done();
    });
  });

  /* jshint expr: true */
  describe('#deepExtend', function() {
    var reqtpl = {
      msg: 'ok',
      subrequests: [
        {
          weight: 1
        }
      ]
    };

    it('should add new fields to the destination object from the overlay', function(done) {
      var self = this
        , req = _.cloneDeep(reqtpl);

      req.subrequests[0].msg2 = 'still ok';

      self.service.getJSONPostResponse(req, function(err, resp) {
        expect(err).to.be.null;
        expect(resp).to.have.property('msg2');
        expect(resp.msg2).to.equal(req.subrequests[0].msg2);
        done();
      });
    });

    it('should update existing fields in the destination object from the overlay', function(done) {
      var self = this
        , req = _.cloneDeep(reqtpl);

      req.subrequests[0].msg = 'still ok';
      self.service.getJSONPostResponse(req, function(err, resp) {
        expect(err).to.be.null;
        expect(resp.msg).to.equal(req.subrequests[0].msg);
        done();
      });
    });
  });
});
