/* jshint newcap:false */
/* global describe, it, beforeEach, before, after */

'use strict';

var promiseCallback = require('../../../utils/promiseCallback');

var originalSetImmediate = global.setImmediate;
var setImmediateFuncNames = [];

function customSetImmediate() {
    setImmediateFuncNames.push(arguments[0].name);
    originalSetImmediate.apply(null, arguments);
}

describe('#promiseCallback', function () {
    beforeAll(function () {
        global.setImmediate = customSetImmediate;
    });

    beforeEach(function () {
        setImmediateFuncNames = [];
    });

    afterAll(function () {
        global.setImmediate = originalSetImmediate;
    });

    describe('Regular execution', function () {
        it('should call callback when promise resolves', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            promiseCallback(promise, function callbackFn(err, result) {
                expect(err).toBeNull();
                expect(result).toBe('resolved');
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('callbackFn');
                done();
            });
        });
        it('should call callback when promise rejects', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            promiseCallback(promise, function callbackFn(err, result) {
                expect(err).toBe('rejected');
                expect(result).toBeUndefined();
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('callbackFn');
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
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('callbackFn');
                expect(caughtError).toBeNull();
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
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('callbackFn');
                expect(caughtError).toBeNull();
                done();
            });
        });
    });

    describe('Optimized execution', function () {
        it('should call callback when promise resolves', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            promiseCallback(
                promise,
                function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBe('resolved');
                    expect(setImmediateFuncNames.length).toBe(0);
                    done();
                },
                {
                    optimize: true,
                },
            );
        });
        it('should call callback when promise rejects', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            promiseCallback(
                promise,
                function (err, result) {
                    expect(err).toBe('rejected');
                    expect(result).toBeUndefined();
                    expect(setImmediateFuncNames.length).toBe(0);
                    done();
                },
                {
                    optimize: true,
                },
            );
        });
        it.skip('should not throw error from success callback in same cycle', function (done) {
            var promise = new Promise(function (resolve, reject) {
                resolve('resolved');
            });
            var caughtError = null;
            try {
                promiseCallback(
                    promise,
                    function callbackFn(err, result) {
                        throw new Error('callback error');
                    },
                    {
                        optimize: true,
                    },
                );
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('doNotSwallowError');
                expect(caughtError).toBeNull();
                done();
            });
        });
        it.skip('should not throw error from failure callback in same cycle', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject('rejected');
            });
            var caughtError = null;
            try {
                promiseCallback(
                    promise,
                    function callbackFn(err, result) {
                        if (err) {
                            throw new Error('callback error');
                        }
                    },
                    {
                        optimize: true,
                    },
                );
            } catch (e) {
                caughtError = e;
            }
            originalSetImmediate(function () {
                expect(setImmediateFuncNames.length).toBe(1);
                expect(setImmediateFuncNames[0]).toBe('doNotSwallowError');
                expect(caughtError).toBeNull();
                done();
            });
        });
    });
});
