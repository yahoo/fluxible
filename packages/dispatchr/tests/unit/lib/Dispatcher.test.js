/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';

var dispatchr = require('../../../index');
var mockStore = require('../../mock/Store');
var delayedStore = require('../../mock/DelayedStore');
var noDehydrateStore = require('../../mock/NoDehydrate');

describe('Dispatchr', function () {
    var dispatcher;

    beforeEach(function () {
        dispatcher = dispatchr.createDispatcher({
            stores: [mockStore, delayedStore, noDehydrateStore],
        });
    });

    it('should not bleed between requires', function () {
        var Dispatcher2 = require('../../../lib/Dispatcher').createDispatcher();
        expect(Dispatcher2.isRegistered(mockStore)).toBe(false);
        Dispatcher2.registerStore(delayedStore);
        expect(Dispatcher2.isRegistered(delayedStore)).toBe(true);
    });

    it('should have handlers registered', function () {
        expect(dispatcher.stores).toBeInstanceOf(Object);
        expect(dispatcher.stores.Store).toBeInstanceOf(Function);
        expect(dispatcher.handlers).toBeInstanceOf(Object);
        expect(Array.isArray(dispatcher.handlers.NAVIGATE)).toBe(true);
        expect(dispatcher.handlers.NAVIGATE.length).toBe(2);
        expect(dispatcher.handlers.NAVIGATE[0].name).toBe('Store');
        expect(dispatcher.handlers.NAVIGATE[0].handler).toBeInstanceOf(
            Function,
        );
    });

    describe('#registerStore', function () {
        it('should throw if store name is already registered', function () {
            var NewStore = function Store() {};
            NewStore.storeName = 'Store';
            expect(function () {
                dispatcher.registerStore(NewStore);
            }).toThrowError(Error);
        });

        it('should not throw if store is registered twice (should silently do nothing)', function () {
            dispatcher.registerStore(mockStore);
            expect(dispatcher.stores).toBeInstanceOf(Object);
            expect(dispatcher.stores.Store).toBeInstanceOf(Function);
        });

        it('should throw if store is not a constructor', function () {
            expect(function () {
                dispatcher.registerStore('store');
            }).toThrowError(Error);
        });

        it('should warn if registering store that relies on name property', function () {
            var oldWarn = console.warn;
            var warning;
            console.warn = function (message) {
                warning = message;
            };
            dispatcher.registerStore(function NewStore() {});
            console.warn = oldWarn;
            expect(warning).toBeDefined();
        });
    });

    describe('#isRegistered', function () {
        it('should return true if store name is registered', function () {
            expect(dispatcher.isRegistered('Store')).toBe(true);
        });

        it('should return false if store name is not registered', function () {
            expect(dispatcher.isRegistered('foo')).toBe(false);
        });

        it('should return false if store with same name is different constructor', function () {
            var store = function () {};
            store.storeName = 'Store';
            expect(dispatcher.isRegistered(store)).toBe(false);
        });
    });

    describe('#getStore', function () {
        it('should give me the same store instance', function () {
            var dispatcherContext = dispatcher.createContext({}),
                mockStoreInstance = dispatcherContext.getStore('Store');

            expect(mockStoreInstance).toBeInstanceOf(Object);

            expect(dispatcherContext.getStore('Store')).toBe(mockStoreInstance);
        });
        it('should allow passing constructor instead of class name', function () {
            var dispatcherContext = dispatcher.createContext({}),
                mockStoreInstance = dispatcherContext.getStore(mockStore);

            expect(mockStoreInstance).toBeInstanceOf(Object);

            expect(dispatcherContext.getStore('Store')).toBe(mockStoreInstance);
        });
        it('should throw if name is invalid', function () {
            var dispatcherContext = dispatcher.createContext({});

            expect(function () {
                dispatcherContext.getStore('Invalid');
            }).toThrowError(Error);
        });
    });

    describe('#dispatch', function () {
        it('should dispatch to store', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('NAVIGATE', {});
            expect(dispatcherContext.storeInstances).toBeInstanceOf(Object);
            expect(dispatcherContext.storeInstances.Store).toBeInstanceOf(
                Object,
            );
            var mockStore = dispatcherContext.storeInstances.Store;
            expect(mockStore.dispatcher).toBeInstanceOf(Object);
            expect(mockStore.dispatcher.getStore).toBeInstanceOf(Function);
            expect(mockStore.dispatcher.waitFor).toBeInstanceOf(Function);
            var state = mockStore.getState();
            expect(state.called).toBe(true);
            expect(state.page).toBe('home');
        });

        it('should allow stores to wait for other stores', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('DELAY', {});
            expect(dispatcherContext.getStore('Store').getState().page).toBe(
                'delay',
            );
        });

        it('should allow stores to wait for other stores even if they do not handle that action', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('WAITFOR', {});
            expect(dispatcherContext.getStore('Store').getState().called).toBe(
                true,
            );
        });

        it('should call stores that registered a default action', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('NAVIGATE', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).toBe(
                true,
            );
            expect(dispatcherContext.getStore(delayedStore).actionHandled).toBe(
                'NAVIGATE',
            );
        });

        it('should call stores that registered a default action that has no other handlers', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('FOO', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).toBe(
                true,
            );
            expect(dispatcherContext.getStore(delayedStore).actionHandled).toBe(
                'FOO',
            );
        });

        it('should not call the default handler if store has explicit action handler', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);
            dispatcherContext.dispatch('DELAY', {});
            expect(dispatcherContext.getStore(delayedStore).defaultCalled).toBe(
                false,
            );
            expect(
                dispatcherContext.getStore(delayedStore).actionHandled,
            ).toBeNull();
        });

        it('should not swallow errors raised by store handler', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);
            expect(function () {
                dispatcherContext.dispatch('ERROR', {});
            }).toThrowError('Store does not have a method called error');
            // Should still allow calling another dispatch
            dispatcherContext.dispatch('DELAY', {});
        });

        it('should throw if a dispatch called with falsy actionName parameter', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            expect(function () {
                dispatcherContext.dispatch(undefined, {
                    dispatcher: dispatcherContext,
                });
            }).toThrowError();
        });

        it('should throw if a dispatch called within dispatch', function () {
            var context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            expect(function () {
                dispatcherContext.dispatch('DISPATCH', {
                    dispatcher: dispatcherContext,
                });
            }).toThrowError();
        });
    });

    describe('#dehydrate', function () {
        var context, expectedState, dispatcherContext;
        beforeEach(function () {
            context = { test: 'test' };
            expectedState = {
                stores: {
                    Store: {
                        called: true,
                        page: 'delay',
                    },
                    DelayedStore: {
                        final: true,
                        page: 'delay',
                    },
                },
            };
            dispatcherContext = dispatcher.createContext(context);
        });

        it('should dehydrate correctly', function () {
            dispatcherContext.dispatch('DELAY', {});
            var state = dispatcherContext.dehydrate();
            expect(state).toEqual(expectedState);
        });

        it('should rehydrate correctly', function () {
            dispatcherContext.rehydrate(expectedState);

            var store = dispatcherContext.getStore(mockStore);
            expect(store).toBeInstanceOf(Object);
            expect(store.dispatcher).toBeInstanceOf(Object);
            expect(store.dispatcher.getStore).toBeInstanceOf(Function);
            expect(store.dispatcher.waitFor).toBeInstanceOf(Function);
            var state = store.getState();
            expect(state.called).toBe(true);
            expect(state.page).toBe('delay');
        });
    });

    describe('#shouldDehydrate', function () {
        it('should not dehydrate stores that return false from shouldDehydrate', function () {
            var dispatcherContext = dispatcher.createContext();
            dispatcherContext.dispatch('NAVIGATE', {});
            var state = dispatcherContext.dehydrate();
            expect(state.stores).toBeInstanceOf(Object);
            expect(state.stores.Store).toBeInstanceOf(Object);
            expect(state.stores.NoDehydrateStore).toBeUndefined();
        });
    });

    describe('#errorHandler', function () {
        it('should handle errors when passed in', function (done) {
            var dispatcher = dispatchr.createDispatcher({
                errorHandler: function (info, context) {
                    expect(info).toBeInstanceOf(Object);
                    expect(info.type).toBe('REGISTER_STORE_NO_CONSTRUCTOR');
                    expect(info.message).toBe(
                        'registerStore requires a constructor as first parameter',
                    );
                    expect(info.meta.error).toBeInstanceOf(Error);
                    done();
                },
            });
            dispatcher.registerStore('DoesNotExist');
        });

        it('should throw an error', function () {
            var dispatcher = dispatchr.createDispatcher({
                errorHandler: function (info, context) {
                    throw new Error(info.message);
                },
            });
            expect(function () {
                dispatcher.registerStore('DoesNotExist');
            }).toThrowError(Error);
        });

        it('should expose context and handle additional meta data', function (done) {
            var NewStore = function Store() {};
            NewStore.storeName = 'NewStore';

            var dispatcher = dispatchr.createDispatcher({
                    errorHandler: function (info, context) {
                        expect(context).toBeInstanceOf(Object);
                        expect(context.test).toBe('test');
                        expect(info).toBeInstanceOf(Object);
                        expect(info.type).toBe('STORE_UNREGISTERED');
                        expect(info.message).toBe(
                            'Store NewStore was not registered.',
                        );
                        expect(info.meta.storeName).toBe('NewStore');
                        expect(info.meta.error).toBeInstanceOf(Error);
                        done();
                    },
                }),
                context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.getStore(NewStore);
        });

        it('should use the error handler when exceptions are thrown', function (done) {
            var dispatcher = dispatchr.createDispatcher({
                    stores: [mockStore],
                    errorHandler: function (info, context) {
                        expect(info.type).toBe('DISPATCH_EXCEPTION');
                        expect(info.message).toBe('Store handler error thrown');
                        expect(info.meta.error).toBeInstanceOf(Error);
                        done();
                    },
                }),
                context = { test: 'test' },
                dispatcherContext = dispatcher.createContext(context);

            dispatcherContext.dispatch('EXCEPTION', {});
        });
    });
});
