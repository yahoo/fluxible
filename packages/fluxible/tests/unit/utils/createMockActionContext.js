/* jshint newcap:false */
/* global describe, it, beforeEach, after */

'use strict';

var expect = require('chai').expect;
var createMockActionContext = require('../../../utils').createMockActionContext;

describe('createMockActionContext', function () {

    describe('instance', function () {
        var context;

        beforeEach(function () {
            context = createMockActionContext();
        });

        it('should have executeActionCalls property', function () {
            expect(context).to.have.property('executeActionCalls').that.is.an('array').and.empty;
        });

        it('should have dispatchCalls property', function () {
            expect(context).to.have.property('dispatchCalls').that.is.an('array').and.empty;
        });

        it('should have dispatcherContext property', function () {
            expect(context).to.have.property('dispatcherContext').that.is.an('object');
        });

        it('should have rootId property', function () {
            expect(context).to.have.property('rootId').that.is.a('number');
        });

        describe('#getStore', function () {
            it('should delegate to the dispatcher getStore method', function () {
                expect(context).to.have.property('getStore');
            });
        });

        describe('#executeAction', function () {
            var mockPayload = {
                foo: 'bar',
                baz: 'fubar'
            };

            function mockAction (ctx, payload, cb) {
                expect(ctx).to.be.an('object');
                expect(ctx.dispatch).to.be.a('function');
                expect(ctx.executeAction).to.be.a('function');
                expect(payload).to.equal(mockPayload);
                return cb();
            }

            function cbResult (done) {
                return function cb () {
                    expect(context.executeActionCalls).to.have.length(1);

                    var call = context.executeActionCalls[0];
                    expect(call).to.have.property('action', mockAction);
                    expect(call).to.have.property('payload', mockPayload);
                    return done();
                }
            }

            it('should provide an executeAction method', function () {
                expect(context).to.respondTo('executeAction');
            });

            it('should execute the action and infer to return a Promise, success', function (done) {
                context.executeAction(mockAction, mockPayload).then(cbResult(done));
            });

            it('should execute the action and infer to return a Promise, failure', function (done) {
                function mockActionFailure (ctx, payload, cb) {
                    cb(new Error('mock'));
                }

                context.executeAction(mockActionFailure, mockPayload).then(function() {
                    done(new Error('should not have resolved successfully'));
                })['catch'](function (error) {
                    expect(error).to.be.an('Error');
                    done();
                });
            });

            it('should execute the action and return a Promise', function (done) {
                var returnValue = 'mock';
                var result = context.executeAction(function (context, payload, fn) {
                    fn(null, returnValue);
                }, mockPayload);
                expect(result.then).to.be.a('function');
                result.then(function (r) {
                    expect(r).to.equal(returnValue);
                    done();
                })['catch'](done);
            });
        });

        describe.skip('#dispatch', function () {
        });
    });
});
