/* jshint newcap:false */
/* global describe, it, before, after */

'use strict';

var createMockComponentContext =
    require('../../../utils').createMockComponentContext;

describe('createMockComponentContext', function () {
    describe('instance', function () {
        var context;

        beforeAll(function () {
            context = createMockComponentContext();
        });

        it('should have the following properties: dispatcher, executeActionCalls', function () {
            expect(context.executeActionCalls).toEqual([]);
        });

        describe('#getStore', function () {
            it('should delegate to the dispatcher getStore method', function () {
                expect(context).toHaveProperty('getStore');
            });
        });

        describe('#executeAction', function () {
            it('should provide an executeAction method', function () {
                expect(context.executeAction).toBeInstanceOf(Function);
            });

            it('should execute the action and pass a MockActionContext', function () {
                var mockPayload = {
                    foo: 'bar',
                    baz: 'fubar',
                };

                function mockAction(ctx, payload, done) {
                    expect(ctx).toBeInstanceOf(Object);
                    expect(ctx.dispatch).toBeInstanceOf(Function);
                    expect(ctx.executeAction).toBeInstanceOf(Function);
                    expect(payload).toBe(mockPayload);
                    done();
                }

                context.executeAction(mockAction, mockPayload);

                expect(context.executeActionCalls).toHaveLength(1);

                var call = context.executeActionCalls[0];
                expect(call).toHaveProperty('action', mockAction);
                expect(call).toHaveProperty('payload', mockPayload);
            });
        });
    });
});
