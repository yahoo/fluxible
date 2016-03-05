/* jshint newcap:false */
/* global describe, it, before, after */

'use strict';

var expect = require('chai').expect;
var createMockComponentContext = require('../../../utils').createMockComponentContext;

describe('createMockComponentContext', function () {

    describe('instance', function () {
        var context;

        before(function () {
            context = createMockComponentContext();
        });

        it('should have the following properties: dispatcher, executeActionCalls', function () {
            expect(context).to.have.property('executeActionCalls').that.is.an('array').and.empty;
        });

        describe('#getStore', function () {
            it('should delegate to the dispatcher getStore method', function () {
                expect(context).to.have.property('getStore');
            });
        });

        describe('#executeAction', function () {
            it('should provide an executeAction method', function () {
                expect(context).to.respondTo('executeAction');
            });

            it('should execute the action and pass a MockActionContext', function () {
                var mockPayload = {
                    foo: 'bar',
                    baz: 'fubar'
                };

                function mockAction (ctx, payload, done) {
                    expect(ctx).to.be.an('object');
                    expect(ctx.dispatch).to.be.a('function');
                    expect(ctx.executeAction).to.be.a('function');
                    expect(payload).to.equal(mockPayload);
                    done();
                }

                context.executeAction(mockAction, mockPayload);

                expect(context.executeActionCalls).to.have.length(1);

                var call = context.executeActionCalls[0];
                expect(call).to.have.property('action', mockAction);
                expect(call).to.have.property('payload', mockPayload);
            });
        });
    });
});
