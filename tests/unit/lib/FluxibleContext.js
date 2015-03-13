/*globals describe,it,beforeEach */
'use strict';
require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var Component = require('../../fixtures/applications/basic/components/Application.jsx');
var Fluxible = require('../../../');
var React = require('react');

describe('FluxibleContext', function () {
    var app;
    var context;

    beforeEach(function () {
        app = new Fluxible({
            component: Component
        });
        context = app.createContext();
    });

    describe('createElement', function () {
        it('should receive the correct props and context', function (done) {
            var Component = React.createFactory(React.createClass({
                displayName: 'Component',
                contextTypes: {
                    getStore: React.PropTypes.func.isRequired,
                    executeAction: React.PropTypes.func.isRequired
                },
                componentWillMount: function () {
                    expect(this.props.foo).to.equal('bar');
                    expect(this.context.getStore).to.be.a('function');
                    expect(this.context.executeAction).to.be.a('function');
                    done();
                },
                render: function () { return null; }
            }));
            var app = new Fluxible({
                component: Component
            });
            context = app.createContext();

            React.renderToString(context.createElement({foo: 'bar'}));
        });
    });

    describe('actionContext', function () {
        var actionContext;
        beforeEach(function () {
            actionContext = context.getActionContext();
        });
        describe ('#executeAction', function () {
            it('should execute the action', function (done) {
                var actionCalls = [];
                var action = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload,
                        callback: callback
                    });
                    callback();
                };
                var payload = {};
                var callback = function () {
                    expect(actionCalls.length).to.equal(1);
                    expect(actionCalls[0].context).to.equal(actionContext);
                    expect(actionCalls[0].payload).to.equal(payload);
                    expect(actionCalls[0].callback).to.equal(callback);
                    done();
                };
                actionContext.executeAction(action, payload, callback);
            });
        });
    });

    describe('componentContext', function () {
        var componentContext;
        beforeEach(function () {
            componentContext = context.getComponentContext();
        });
        describe ('#executeAction', function () {
            it('should execute the action', function (done) {
                var callback = function () {
                    throw new Error('This should not be called');
                };
                var action = function (actionContext, payload, cb) {
                    expect(actionContext).to.equal(context.getActionContext());
                    expect(payload).to.equal(payload);
                    expect(callback).to.not.equal(cb);
                    done();
                };
                var payload = {};
                componentContext.executeAction(action, payload, callback);
            });
            it('should use the defined component action handler', function (done) {
                var myActionHandler = function (context, payload, cb) {
                    expect(payload.err).to.be.an('object');
                    done();
                };
                var app2 = new Fluxible({
                    component: Component,
                    componentActionHandler: myActionHandler
                });
                var context2 = app2.createContext();
                var componentContext2 = context2.getComponentContext();
                var action = function (context, payload, cb) {
                    cb(Error('Something went wrong'));
                };

                componentContext2.executeAction(action, {});
            });
        });
    });

    describe('storeContext', function () {
        var storeContext;
        beforeEach(function () {
            storeContext = context.getStoreContext();
        });
        it('should be an object', function () {
            expect(storeContext).to.be.an('object');
        });
    });

    describe('serialization', function () {
        it('should dehydrate and rehydrate with the same context', function (done) {
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
        var dimensionsPlugin = require('../../fixtures/plugins/DimensionsContextPlugin'),
            dimensions = {
                foo: 'bar'
            };
        beforeEach(function () {
            context.plug(dimensionsPlugin(dimensions));
        });
        it('should throw if the plugin does not have a name', function () {
            expect(function () {
                context.plug({});
            }).to.throw();
        });
        it('should add the getDimensions function to the action context', function () {
            var actionContext = context.getActionContext();
            expect(actionContext).to.be.an('object');
            expect(actionContext.getDimensions).to.be.a('function');
            expect(actionContext.getDimensions()).to.deep.equal(dimensions);
        });
        it('should add the getDimensions function to the component context', function () {
            var componentContext = context.getComponentContext();
            expect(componentContext).to.be.an('object');
            expect(componentContext.getDimensions).to.be.a('function');
            expect(componentContext.getDimensions()).to.deep.equal(dimensions);
        });
        it('should add the getDimensions function to the store context', function () {
            var storeContext = context.getStoreContext();
            expect(storeContext).to.be.an('object');
            expect(storeContext.getDimensions).to.be.a('function');
            expect(storeContext.getDimensions()).to.deep.equal(dimensions);
        });
        it('should dehydrate and rehydrate the plugin correctly', function () {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(context.dehydrate()));
            expect(state).to.be.an('object');
            expect(state.dispatcher).to.be.an('object');
            expect(state.plugins).to.be.an('object');
            expect(state.plugins.DimensionsPlugin).to.be.an('object');
            expect(state.plugins.DimensionsPlugin.dimensions).to.deep.equal(dimensions);
            var newContext = app.createContext();
            newContext.plug(dimensionsPlugin());
            newContext.rehydrate(state);
            expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
            expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
            expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
        });
    });

});
