/* jshint newcap:false */
/* global describe, it, beforeEach, after */

'use strict';

var createMockActionContext = require('../../../utils').createMockActionContext;

describe('createMockActionContext', function () {
    describe('instance', function () {
        var context;

        beforeEach(function () {
            context = createMockActionContext();
        });

        it('should have executeActionCalls property', function () {
            expect(context.executeActionCalls).toEqual([]);
        });

        it('should have dispatchCalls property', function () {
            expect(context.dispatchCalls).toEqual([]);
        });

        it('should have dispatcherContext property', function () {
            expect(context.dispatcherContext).toBeInstanceOf(Object);
        });

        it('should have rootId property', function () {
            expect(context.rootId).toEqual(expect.any(Number));
        });

        describe('#getStore', function () {
            it('should delegate to the dispatcher getStore method', function () {
                expect(context).toHaveProperty('getStore');
            });
        });

        describe('#executeAction', function () {
            var mockPayload = {
                foo: 'bar',
                baz: 'fubar',
            };

            function mockAction(ctx, payload, cb) {
                expect(ctx).toBeInstanceOf(Object);
                expect(ctx.dispatch).toBeInstanceOf(Function);
                expect(ctx.executeAction).toBeInstanceOf(Function);
                expect(payload).toBe(mockPayload);
                return cb();
            }

            function cbResult(done) {
                return function cb() {
                    expect(context.executeActionCalls).toHaveLength(1);

                    var call = context.executeActionCalls[0];
                    expect(call).toHaveProperty('action', mockAction);
                    expect(call).toHaveProperty('payload', mockPayload);
                    return done();
                };
            }

            it('should provide an executeAction method', function () {
                expect(context.executeAction).toBeInstanceOf(Function);
            });

            it('should execute the action and infer to return a Promise, success', function (done) {
                context
                    .executeAction(mockAction, mockPayload)
                    .then(cbResult(done));
            });

            it('should execute the action and infer to return a Promise, failure', function (done) {
                function mockActionFailure(ctx, payload, cb) {
                    cb(new Error('mock'));
                }

                context
                    .executeAction(mockActionFailure, mockPayload)
                    .then(function () {
                        done(
                            new Error('should not have resolved successfully'),
                        );
                    })
                    .catch(function (error) {
                        expect(error).toBeInstanceOf(Error);
                        done();
                    });
            });

            it('should execute the action and return a Promise', function (done) {
                var returnValue = 'mock';
                var result = context.executeAction(function (
                    context,
                    payload,
                    fn,
                ) {
                    fn(null, returnValue);
                }, mockPayload);
                expect(result.then).toBeInstanceOf(Function);
                result
                    .then(function (r) {
                        expect(r).toBe(returnValue);
                        done();
                    })
                    .catch(done);
            });
        });

        describe.skip('#dispatch', function () {});
    });
});
