/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';

var expect = require('chai').expect;
var dispatchr = require('../../../index');
var mockStore = require('../../mock/Store');
var delayedStore = require('../../mock/DelayedStore');
var noDehydrateStore = require('../../mock/NoDehydrate');

describe('Dispatchr', function () {
    var dispatcher;

    beforeEach(function () {
        dispatcher = dispatchr.createDispatcher({
            stores: [mockStore, delayedStore, noDehydrateStore]
        });
    });

    it('should not bleed between requires', function () {
        var Dispatcher2 = require('../../../lib/Dispatcher').createDispatcher();
        expect(Dispatcher2.isRegistered(mockStore)).to.equal(false);
        Dispatcher2.registerStore(delayedStore);
        expect(Dispatcher2.isRegistered(delayedStore)).to.equal(true);
    });

    it('should have handlers registered', function () {
        expect(dispatcher.stores).to.be.an('object');
        expect(dispatcher.stores.Store).to.be.a('function');
        expect(dispatcher.handlers).to.be.an('object');
        expect(dispatcher.handlers.NAVIGATE).to.be.an('array');
        expect(dispatcher.handlers.NAVIGATE.length).to.equal(2);
        expect(dispatcher.handlers.NAVIGATE[0].name).to.equal('Store');
        expect(dispatcher.handlers.NAVIGATE[0].handler).be.a('function');
    });

    describe('#registerStore', function () {
        it('should throw if store name is already registered', function () {
            var NewStore = function Store () {};
            NewStore.storeName = 'Store';
            expect(function () {
                dispatcher.registerStore(NewStore);
            }).to['throw'](Error);
        });

        it('should not throw if store is registered twice (should silently do nothing)', function () {
            dispatcher.registerStore(mockStore);
            expect(dispatcher.stores).to.be.an('object');
            expect(dispatcher.stores.Store).to.be.a('function');
        });

        it('should throw if store is not a constructor', function () {
            expect(function () {
                dispatcher.registerStore('store');
            }).to['throw'](Error);
        });

        it('should warn if registering store that relies on name property', function () {
            var oldWarn = console.warn;
            var warning;
            console.warn = function(message) {
                warning = message;
            };
            dispatcher.registerStore(function NewStore() {});
            console.warn = oldWarn;
            expect(warning).to.not.equal(undefined);
        });
    });

    describe('#isRegistered', function () {
        it('should return true if store name is registered', function () {
            expect(dispatcher.isRegistered('Store')).to.equal(true);
        });

        it('should return false if store name is not registered', function () {
            expect(dispatcher.isRegistered('foo')).to.equal(false);
        });

        it('should return false if store with same name is different constructor', function () {
            var store = function () {};
            store.storeName = 'Store';
            expect(dispatcher.isRegistered(store)).to.equal(false);
        });
    });

    describe('#getStore', function () {
        it('should give me the same store instance', function () {
            var dispatcherContext = dispatcher.createContext({}),
                mockStoreInstance = dispatcherContext.getStore('Store');

            expect(mockStoreInstance).to.be.an('object');

            expect(dispatcherContext.getStore('Store')).to.equal(mockStoreInstance);
        });
        it('should allow passing constructor instead of class name', function () {
            var dispatcherContext = dispatcher.createContext({}),
                mockStoreInstance = dispatcherContext.getStore(mockStore);

            expect(mockStoreInstance).to.be.an('object');

            expect(dispatcherContext.getStore('Store')).to.equal(mockStoreInstance);
        });
        it('should throw if name is invalid', function () {
            var dispatcherContext = dispatcher.createContext({});

            expect(function () {
                dispatcherContext.getStore('Invalid');
            }).to['throw'](Error);
        });
    });

    describe('#dispatch', function () {
        it('should dispatch to store', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('NAVIGATE', {});
            expect(dispatcherContext.storeInstances).to.be.an('object');
            expect(dispatcherContext.storeInstances.Store).to.be.an('object');
            var mockStore = dispatcherContext.storeInstances.Store;
            expect(mockStore.dispatcher).to.be.an('object');
            expect(mockStore.dispatcher.getStore).to.be.a('function');
            expect(mockStore.dispatcher.waitFor).to.be.a('function');
            var state = mockStore.getState();
            expect(state.called).to.equal(true);
            expect(state.page).to.equal('home');
        });

        it('should allow stores to wait for other stores', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('DELAY', {});
            expect(dispatcherContext.getStore('Store').getState().page).to.equal('delay');
        });

        it('should allow stores to wait for other stores even if they do not handle that action', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('WAITFOR', {});
            expect(dispatcherContext.getStore('Store').getState().called).to.equal(true);
        });

        it('should call stores that registered a default action', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('NAVIGATE', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).to.equal(true);
            expect(dispatcherContext.getStore(delayedStore).actionHandled).to.equal('NAVIGATE');
        });

        it('should call stores that registered a default action that has no other handlers', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('FOO', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).to.equal(true);
            expect(dispatcherContext.getStore(delayedStore).actionHandled).to.equal('FOO');
        });

        it('should not call the default handler if store has explicit action handler', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);
            dispatcherContext.dispatch('DELAY', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).to.equal(false);
            expect(dispatcherContext.getStore(delayedStore).actionHandled).to.equal(null);
        });

        it('should not swallow errors raised by store handler', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);
            expect(function () {
                dispatcherContext.dispatch('ERROR', {});
            }).to['throw']('Store does not have a method called error');
            // Should still allow calling another dispatch
            dispatcherContext.dispatch('DELAY', {});
        });

        it('should throw if a dispatch called with falsy actionName parameter', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            expect(function () {
                dispatcherContext.dispatch(undefined, {
                    dispatcher: dispatcherContext
                });
            }).to['throw']();
        });

        it('should throw if a dispatch called within dispatch', function () {
            var context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            expect(function () {
                dispatcherContext.dispatch('DISPATCH', {
                    dispatcher: dispatcherContext
                });
            }).to['throw']();
        });
    });

    describe('#dehydrate', function () {
        var context,
            expectedState,
            dispatcherContext;
        beforeEach(function () {
            context = { test: 'test' };
            expectedState = {
                stores: {
                    Store: {
                        called: true,
                        page: 'delay'
                    },
                    DelayedStore: {
                        final: true,
                        page: 'delay'
                    }
                }
            };
            dispatcherContext = dispatcher.createContext(context);
        });

        it('should dehydrate correctly', function () {
            dispatcherContext.dispatch('DELAY', {});
            var state = dispatcherContext.dehydrate();
            expect(state).to.deep.equal(expectedState);
        });

        it('should rehydrate correctly', function () {
            dispatcherContext.rehydrate(expectedState);

            var store = dispatcherContext.getStore(mockStore);
            expect(store).to.be.an('object');
            expect(store.dispatcher).to.be.an('object');
            expect(store.dispatcher.getStore).to.be.a('function');
            expect(store.dispatcher.waitFor).to.be.a('function');
            var state = store.getState();
            expect(state.called).to.equal(true);
            expect(state.page).to.equal('delay');
        });
    });

    describe('#shouldDehydrate', function () {
        it('should not dehydrate stores that return false from shouldDehydrate', function () {
            var dispatcherContext = dispatcher.createContext();
            dispatcherContext.dispatch('NAVIGATE', {});
            var state = dispatcherContext.dehydrate();
            expect(state.stores).to.be.an('object');
            expect(state.stores.Store).be.an('object');
            expect(state.stores.NoDehydrateStore).to.equal(undefined);
        });
    });

    describe('#errorHandler', function () {
        it('should handle errors when passed in', function (done) {
            var dispatcher = dispatchr.createDispatcher({
                errorHandler: function (info, context) {
                    expect(info).to.be.an('object');
                    expect(info.type).equal('REGISTER_STORE_NO_CONSTRUCTOR');
                    expect(info.message).equal('registerStore requires a constructor as first parameter');
                    expect(info.meta.error).to.be.an.instanceOf(Error);
                    done();
                }
            });
            dispatcher.registerStore('DoesNotExist');
        });

        it('should throw an error', function () {
            var dispatcher = dispatchr.createDispatcher({
                errorHandler: function (info, context) {
                    throw new Error(info.message);
                }
            });
            expect(function () {
                dispatcher.registerStore('DoesNotExist');
            }).to['throw'](Error);
        });

        it('should expose context and handle additional meta data', function (done) {
            var NewStore = function Store () {};
            NewStore.storeName = 'NewStore';

            var dispatcher = dispatchr.createDispatcher({
                    errorHandler: function (info, context) {
                        expect(context).to.be.an('object');
                        expect(context.test).equal('test');
                        expect(info).to.be.an('object');
                        expect(info.type).equal('STORE_UNREGISTERED');
                        expect(info.message).equal('Store NewStore was not registered.');
                        expect(info.meta.storeName).equal('NewStore');
                        expect(info.meta.error).to.be.an.instanceOf(Error);
                        done();
                    }
                }),
                context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.getStore(NewStore);
        });

        it('should use the error handler when exceptions are thrown', function (done) {
            var dispatcher = dispatchr.createDispatcher({
                    stores: [mockStore],
                    errorHandler: function (info, context) {
                        expect(info.type).equal('DISPATCH_EXCEPTION');
                        expect(info.message).equal('Store handler error thrown');
                        expect(info.meta.error).to.be.an.instanceOf(Error);
                        done();
                    }
                }),
                context = {test: 'test'},
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('EXCEPTION', {});
        })
    });

});
