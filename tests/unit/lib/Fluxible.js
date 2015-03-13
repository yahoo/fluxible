/*globals describe,it,beforeEach */
"use strict";
require('node-jsx').install({ extension: '.jsx' });

var path = require('path');
var expect = require('chai').expect;
var Component = require('../../fixtures/applications/basic/components/Application.jsx');
var Fluxible = require('../../../');

describe('Fluxible', function () {
    var app;
    var FooStore;

    beforeEach(function () {
        FooStore = function () {};
        FooStore.storeName = 'FooStore';
        app = new Fluxible({
            component: Component
        });
    });

    describe('#createContext', function () {
        it('should create a valid context', function () {
            var context = app.createContext();
            expect(context).to.be.an('object');
        });
    });

    describe('#getComponent', function () {
        it('should return the app component', function () {
            expect(app.getComponent()).to.be.a('function');
            expect(app.getComponent().displayName).to.equal('Application');
        });
    });

    describe('#registerStore', function () {
        it('should register the new store', function () {
            app.registerStore(FooStore);
            expect(app._dispatcherClass.isRegistered(FooStore)).to.equal(true);
        });
    });

    describe('dehydrate', function () {
        it('should dehydrate and rehydrate with the same context', function (done) {
            var context = app.createContext();
            var json = app.dehydrate(context);
            var newApp = new Fluxible({
                component: Component
            });
            newApp.rehydrate(json, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext).to.be.an('object');
                done();
            });
        });
    });

    describe('plugins', function () {
        var testPlugin = require('../../fixtures/plugins/TestApplicationPlugin'),
            pluginInstance,
            foo = 'bar',
            context;
        beforeEach(function () {
            pluginInstance = testPlugin(foo);
            app.plug(pluginInstance);
            context = app.createContext();
        });
        it('should throw if the plugin does not have a name', function () {
            expect(function () {
                app.plug({});
            }).to.throw();
        });
        it('should provide access to the plugin instance', function () {
            expect(app.getPlugin(pluginInstance.name)).to.equal(pluginInstance);
        });
        it('should add the getFoo function to the action context', function () {
            var actionContext = context.getActionContext();
            expect(actionContext).to.be.an('object');
            expect(actionContext.getFoo).to.be.a('function');
            expect(actionContext.getFoo()).to.equal(foo);
        });
        it('should add the getDimensions function to the component context', function () {
            var componentContext = context.getComponentContext();
            expect(componentContext).to.be.an('object');
            expect(componentContext.getFoo).to.be.a('function');
            expect(componentContext.getFoo()).to.equal(foo);
        });
        it('should add the getDimensions function to the store context', function () {
            var storeContext = context.getStoreContext();
            expect(storeContext).to.be.an('object');
            expect(storeContext.getFoo).to.be.a('function');
            expect(storeContext.getFoo()).to.equal(foo);
        });
        it('should dehydrate and rehydrate the plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(app.dehydrate(context)));
            expect(state).to.be.an('object');
            expect(state.context).to.be.an('object');
            expect(state.context.dispatcher).to.be.an('object');
            expect(state.context.plugins).to.be.an('object');
            expect(state.plugins).to.be.an('object');
            expect(state.plugins.TestAppPlugin).to.be.an('object');
            expect(state.plugins.TestAppPlugin.foo).to.equal(foo);
            var newApp = new Fluxible({
                component: Component
            });
            newApp.plug(testPlugin());
            newApp.rehydrate(state, function (err, newContext) {
                if (err) {
                    done(err);
                    return;
                }
                expect(newContext.getActionContext().getFoo()).to.equal(foo);
                expect(newContext.getComponentContext().getFoo()).to.equal(foo);
                expect(newContext.getStoreContext().getFoo()).to.equal(foo);
                done();
            });
        });
    });

});
