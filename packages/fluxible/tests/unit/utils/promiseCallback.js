/* jshint newcap:false */
/* global describe, it, beforeEach, before, after */

'use strict';

var expect = require('chai').expect;
var promiseCallback = require('../../../utils/promiseCallback');

var originalSetImmediate = global.setImmediate;
var setImmediateFuncNames = [];

function customSetImmediate() {
    setImmediateFuncNames.push(arguments[0].name);
    originalSetImmediate.apply(null, arguments);
}

describe('#promiseCallback', function () {
    before(function() {
        global.setImmediate = customSetImmediate;
    });

    beforeEach(function () {
        setImmediateFuncNames = [];
    });

    after(function() {
        global.setImmediate = originalSetImmediate;
    });

    describe('Regular execution', function () {
        it('should call callback when promise resolves', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            promiseCallback(promise, function callbackFn(err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('resolved');
                expect(setImmediateFuncNames.length).to.equal(1);
                expect(setImmediateFuncNames[0]).to.equal('callbackFn');
                done();
            });
        });
        it('should call callback when promise rejects', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            promiseCallback(promise, function callbackFn(err, result) {
                expect(err).to.equal('rejected');
                expect(result).to.equal(undefined);
                expect(setImmediateFuncNames.length).to.equal(1);
                expect(setImmediateFuncNames[0]).to.equal('callbackFn');
                done();
            });
        });
        it.skip('should not throw error from success callback in same cycle', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            var caughtError = null;
            try {
                promiseCallback(promise, function callbackFn(err, result) {
                    throw new Error('callback error');
                });
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).to.equal(1);
                expect(setImmediateFuncNames[0]).to.equal('callbackFn');
                expect(caughtError).to.equal(null);
                done();
            });
        });
        it.skip('should not throw error from failure callback in same cycle', function (done) {
            var promise = new Promise(function callbackFn(resolve, reject) {
                reject('rejected');
            });
            var caughtError = null;
            try {
                promiseCallback(promise, function callbackFn(err, result) {
                    if (err) {
                        throw new Error('callback error');
                    }
                });
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).to.equal(1);
                expect(setImmediateFuncNames[0]).to.equal('callbackFn');
                expect(caughtError).to.equal(null);
                done();
            });
        });
    });

    describe('Optimized execution', function () {
        it('should call callback when promise resolves', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            promiseCallback(promise, function (err, result) {
                expect(err).to.equal(null);
                expect(result).to.equal('resolved');
                expect(setImmediateFuncNames.length).to.equal(0,
                    'no setImmediate for successful callback');
                done();
            }, {
                optimize: true
            });
        });
        it('should call callback when promise rejects', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            promiseCallback(promise, function (err, result) {
                expect(err).to.equal('rejected');
                expect(result).to.equal(undefined);
                expect(setImmediateFuncNames.length).to.equal(0,
                    'no setImmediate for successful callback');
                done();
            }, {
                optimize: true
            });
        });
        it.skip('should not throw error from success callback in same cycle', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            var caughtError = null;
            try {
                promiseCallback(promise, function callbackFn(err, result) {
                    throw new Error('callback error');
                }, {
                    optimize: true
                });
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).to.equal(1,
                    '1 setImmediate for bad callback');
                expect(setImmediateFuncNames[0]).to.equal('doNotSwallowError');
                expect(caughtError).to.equal(null);
                done();
            });
        });
        it.skip('should not throw error from failure callback in same cycle', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            var caughtError = null;
            try {
                promiseCallback(promise, function callbackFn(err, result) {
                    if (err) {
                        throw new Error('callback error');
                    }
                }, {
                    optimize: true
                });
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).to.equal(1,
                    '1 setImmediate for bad callback');
                expect(setImmediateFuncNames[0]).to.equal('doNotSwallowError');
                expect(caughtError).to.equal(null);
                done();
            });
        });
    });
});
