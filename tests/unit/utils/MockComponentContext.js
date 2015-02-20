/* jshint newcap:false */
/* global describe, it, before, after */

'use strict';

var ROOT_DIR = require('path').resolve(__dirname + '/../../..');

var expect = require('chai').expect;
var mockery = require('mockery');

describe('MockComponentContext', function () {
    var ComponentContext;

    function dispatchr () {}
    dispatchr.prototype.getStore = function () {};

    function MockActionContext () {}

    before(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mockery.registerMock('dispatchr', function () {
            return dispatchr;
        });

        mockery.registerMock('./MockActionContext', function () {
                return MockActionContext;
            }
        );

        ComponentContext = require(ROOT_DIR + '/utils/MockComponentContext')();
    });

    it('should be a constructor', function () {
        expect(new ComponentContext()).to.be.an.instanceof(ComponentContext);
    });

    it('should have a Dispatcher property that is a dispatchr constructor', function() {
        expect(ComponentContext).to.have.property('Dispatcher', dispatchr);
    });

    describe('instance', function () {
        var context;

        before(function () {
            context = new ComponentContext();
        });

        it('should have the following properties: dispatcher, executeActionCalls', function () {
            expect(context).to.have.property('dispatcher').that.is.an.instanceof(dispatchr);
            expect(context).to.have.property('executeActionCalls').that.is.an('array').and.empty;
        });

        describe('#getStore', function () {
            it('should delegate to the dispatcher getStore method', function () {
                expect(context).to.have.property('getStore', dispatchr.getStore);
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
                    expect(ctx).to.be.an.instanceof(MockActionContext);
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

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });
});
