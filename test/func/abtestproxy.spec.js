'use strict';

var chai = require('chai')
  , _ = require('lodash')
  , TestService = require('../lib/testservice')
  , expect = chai.expect;

/* jshint expr: true */
describe('ABTestProxy service', function() {
  beforeEach('Start service', function(done) {
    var self = this;
    self.service = new TestService();
    self.service.listen(done);
  });

  afterEach('Stop service', function(done) {
    var self = this;
    self.service.close(done);
  });

  it('should accept JSON POST requests', function(done) {
    this.service.sendJSONPostRequest({msg: 'ok'}, function(err, res) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should pass the endpoint response code through to the caller', function(done) {
    this.service.sendJSONPostRequest({msg: 'ok'}, {'X-MSys-Set-Status-Code': 500}, function(err, resp) {
      expect(err).to.be.null;
      expect(resp.statusCode).to.equal(500);
      done();
    });
  });

  it('should pass the endpoint response content type through to the caller', function(done) {
    var customContentType = 'application/x-bob';
    this.service.sendJSONPostRequest({msg: 'ok'}, {'content-type': customContentType}, function(err, resp) {
      expect(err).to.be.null;
      expect(resp.headers['content-type']).to.equal(customContentType);
      done();
    });
  });

  it('should pass the endpoint response body through to the caller', function(done) {
    var req = {msg: 'ok'};
    this.service.getJSONPostResponse(req, function(err, resp) {
      expect(err).to.be.null;
      expect(resp).to.deep.equal(req);
      done();
    });
  });

  it('should strip the subrequests key from JSON requests', function(done) {
    var testJSON = {
      msg: 'ok',
      subrequests: [
        {weight: 0.0, msg: 'option 1'},
        {weight: 1.0, msg: 'option 2'}
      ]
    };

    this.service.getJSONPostResponse(testJSON, function(err, resp) {
      expect(err).to.be.null;
      expect(resp).to.have.property('msg');
      done();
    });
  });

  it('should overwrite fields in the top-level request with those in a selected subrequest object', function(done) {
    var testJSON = {
      msg: 'ok',
      subrequests: [
        {weight: 0.0, msg: 'option 1'},
        {weight: 1.0, msg: 'option 2'}
      ]
    }
      , expectedJSON = _.cloneDeep(testJSON);

    delete expectedJSON.subrequests;
    expectedJSON.msg = testJSON.subrequests[1].msg;

    this.service.getJSONPostResponse(testJSON, function(err, resp) {
      expect(err).to.be.null;
      expect(resp.msg).to.equal(testJSON.subrequests[1].msg);
      expect(resp).to.deep.equal(expectedJSON);
      done();
    });
  });

  it('should overwrite nested fields in the top-level request with those in a selected subrequest object', function(done) {
    var testJSON = {
      topLevel: 207,
      nest: {
        msg: 'ok',
        otherfld1: 'bob',
        otherfld2: 101
      },
      subrequests: [
        {weight: 0.0, nest: {msg: 'option 1'}},
        {weight: 1.0, nest: {msg: 'option 2'}}
      ]
    }
      , expectedJSON = _.cloneDeep(testJSON);

    delete expectedJSON.subrequests;
    expectedJSON.nest.msg = testJSON.subrequests[1].nest.msg;

    this.service.getJSONPostResponse(testJSON, function(err, resp) {
      expect(err).to.be.null;
      expect(resp.nest.msg).to.equal(testJSON.subrequests[1].nest.msg);
      expect(resp).to.deep.equal(expectedJSON);
      done();
    });
  });
});
