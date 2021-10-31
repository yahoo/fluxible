/*globals describe,it,beforeEach */
'use strict';

var path = require('path');
var Fluxible = require('../../../');

var MockComponent = function () {};
MockComponent.displayName = 'Application';

describe('Fluxible', function () {
    var app;
    var FooStore;

    beforeEach(function () {
        FooStore = function () {};
        FooStore.storeName = 'FooStore';
        app = new Fluxible({
            component: MockComponent,
        });
    });

    describe('#createContext', function () {
        it('should create a valid context', function () {
            var context = app.createContext();
            expect(context).toBeInstanceOf(Object);
        });
    });

    describe('#getComponent', function () {
        it('should return the app component', function () {
            expect(app.getComponent()).toBeInstanceOf(Function);
            expect(app.getComponent().displayName).toBe('Application');
        });
    });

    describe('#registerStore', function () {
        it('should register the new store', function () {
            app.registerStore(FooStore);
            expect(app._dispatcher.isRegistered(FooStore)).toBe(true);
        });
    });

    describe('dehydrate', function () {
        it('should dehydrate and rehydrate with the same context', function (done) {
            var context = app.createContext();
            var json = app.dehydrate(context);
            var newApp = new Fluxible({
                component: MockComponent,
            });
            newApp.rehydrate(json, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext).toBeInstanceOf(Object);
                done();
            });
        });
    });

    describe('rehydrate', function () {
        it('should rehydrate with empty object', function (done) {
            var newApp = new Fluxible({
                component: MockComponent,
            });
            newApp.rehydrate({}, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext).toBeInstanceOf(Object);
                done();
            });
        });
    });

    describe('plugins', function () {
        var testPlugin = require('../../fixtures/plugins/TestApplicationPlugin'),
            testPluginSync = require('../../fixtures/plugins/TestApplicationPluginSync'),
            testPluginPromise = require('../../fixtures/plugins/TestApplicationPluginPromise'),
            pluginInstance,
            foo = 'bar',
            bar = 'baz',
            context;
        beforeEach(function () {
            pluginInstance = testPlugin(foo, bar);
            app.plug(pluginInstance);
            context = app.createContext();
        });
        it('should throw if the plugin does not have a name', function () {
            expect(function () {
                app.plug({});
            }).toThrowError();
        });
        it('should not throw when plugContext does not return an object', function () {
            expect(function () {
                app.plug({
                    name: 'OnlyPlugContextPlugin',
                    plugContext: function () {},
                });
                context = app.createContext();
            }).not.toThrowError();
        });
        it('should provide access to the plugin instance', function () {
            expect(app.getPlugin(pluginInstance.name)).toBe(pluginInstance);
        });
        it('should add the getFoo function to the action context', function () {
            var actionContext = context.getActionContext();
            expect(actionContext).toBeInstanceOf(Object);
            expect(actionContext.getFoo).toBeInstanceOf(Function);
            expect(actionContext.getFoo()).toBe(foo);
        });
        it('should add the getDimensions function to the component context', function () {
            var componentContext = context.getComponentContext();
            expect(componentContext).toBeInstanceOf(Object);
            expect(componentContext.getFoo).toBeInstanceOf(Function);
            expect(componentContext.getFoo()).toBe(foo);
        });
        it('should add the getDimensions function to the store context', function () {
            var storeContext = context.getStoreContext();
            expect(storeContext).toBeInstanceOf(Object);
            expect(storeContext.getFoo).toBeInstanceOf(Function);
            expect(storeContext.getFoo()).toBe(foo);
        });
        it('should dehydrate and rehydrate the async plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(app.dehydrate(context)));
            expect(state).toBeInstanceOf(Object);
            expect(state.context).toBeInstanceOf(Object);
            expect(state.context.dispatcher).toBeInstanceOf(Object);
            expect(state.context.plugins).toBeInstanceOf(Object);
            expect(state.plugins).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin.foo).toBe(foo);
            var newApp = new Fluxible({
                component: MockComponent,
            });
            newApp.plug(testPlugin());
            newApp.rehydrate(state, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext.getActionContext().getFoo()).toBe(foo);
                expect(newContext.getActionContext().getBar()).toBe(bar);
                expect(newContext.getComponentContext().getFoo()).toBe(foo);
                expect(newContext.getStoreContext().getFoo()).toBe(foo);
                done();
            });
        });
        it('should dehydrate and rehydrate the sync plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(app.dehydrate(context)));
            expect(state).toBeInstanceOf(Object);
            expect(state.context).toBeInstanceOf(Object);
            expect(state.context.dispatcher).toBeInstanceOf(Object);
            expect(state.context.plugins).toBeInstanceOf(Object);
            expect(state.plugins).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin.foo).toBe(foo);
            var newApp = new Fluxible({
                component: MockComponent,
            });
            newApp.plug(testPluginSync());
            newApp.rehydrate(state, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext.getActionContext().getFoo()).toBe(foo);
                expect(newContext.getActionContext().getBar()).toBe(bar);
                expect(newContext.getComponentContext().getFoo()).toBe(foo);
                expect(newContext.getStoreContext().getFoo()).toBe(foo);
                done();
            });
        });
        it('should dehydrate and rehydrate the promise plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(app.dehydrate(context)));
            expect(state).toBeInstanceOf(Object);
            expect(state.context).toBeInstanceOf(Object);
            expect(state.context.dispatcher).toBeInstanceOf(Object);
            expect(state.context.plugins).toBeInstanceOf(Object);
            expect(state.plugins).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin).toBeInstanceOf(Object);
            expect(state.plugins.TestAppPlugin.foo).toBe(foo);
            var newApp = new Fluxible({
                component: MockComponent,
            });
            newApp.plug(testPluginPromise());
            newApp.rehydrate(state, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext.getActionContext().getFoo()).toBe(foo);
                expect(newContext.getActionContext().getBar()).toBe(bar);
                expect(newContext.getComponentContext().getFoo()).toBe(foo);
                expect(newContext.getStoreContext().getFoo()).toBe(foo);
                done();
            });
        });
    });
});
