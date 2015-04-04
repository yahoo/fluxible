/*globals describe,it,beforeEach */
'use strict';

var expect = require('chai').expect;
var Component = require('../../fixtures/applications/basic/components/Application.jsx');
var provideContext = require('../../../addons/provideContext');
var Fluxible = require('../../../');
var FluxibleContext = require('../../../lib/FluxibleContext');
var isPromise = require('is-promise');
var React = require('react');
var domain = require('domain');

// Fix for https://github.com/joyent/node/issues/8648
FluxibleContext.Promise = require('es6-promise').Promise;

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
        it('should receive the correct props and context when using FluxibleComponent', function (done) {
            var Component = React.createClass({
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
            });
            var app = new Fluxible({
                component: Component
            });
            context = app.createContext();

            React.renderToString(context.createElement({foo: 'bar'}));
        });
        it('should receive the correct props and context when using contextProvider', function (done) {
            var Component = React.createClass({
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
            });
            Component = provideContext(Component);
            var app = new Fluxible({
                component: Component
            });
            context = app.createContext();

            React.renderToString(context.createElement({foo: 'bar'}));
        });
        it('should receive the correct props and context if passed factory', function (done) {
            var Component = React.createClass({
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
            });
            var app = new Fluxible({
                component: Component
            });
            context = app.createContext();

            React.renderToString(context.createElement({foo: 'bar'}));
        });
    });

    describe('actionContext', function () {
        var actionContext;
        var actionCalls;
        beforeEach(function () {
            actionContext = context.getActionContext();
            actionCalls = [];
        });
        describe ('#executeAction', function () {
            it('should return a promise', function (done) {
                var promise = actionContext.executeAction(function () {}, {}).catch(done);
                expect(isPromise(promise)).to.equal(true);
                done();
            });

            it('should set a default payload', function (done) {
                var action = function (context, payload) {
                    return payload;
                };
                actionContext.executeAction(action)
                .then(function (result) {
                    expect(result).to.be.an('object');
                    done();
                }).catch(done);
            });

            it('should execute the action', function (done) {
                var action = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                var payload = {};
                var callback = function () {
                    expect(actionCalls.length).to.equal(1);
                    expect(actionCalls[0].context).to.equal(actionContext);
                    expect(actionCalls[0].payload).to.equal(payload);
                    done();
                };
                actionContext.executeAction(action, payload, callback);
            });

            it('should call executeAction callback with errors', function (done) {
                var err = new Error();
                var action = function (context, payload, callback) {
                    callback(err);
                };
                actionContext.executeAction(action, {}, function (executeActionError) {
                    expect(executeActionError).to.equal(err);
                    done();
                });
            });

            it('should not swallow callback errors', function (done) {
                // Error is expected, but will not be catchable. Crudely using domain.
                var testError = new Error('test');
                var d = domain.create();
                d.on('error', function (e) {
                    expect(e).to.equal(testError);
                    done();
                });
                d.run(function () {
                    var action = function (context, payload, callback) {
                        callback();
                    };
                    var payload = {};
                    var calledOnce = false;
                    var callback = function () {
                        // Without setImmediate in executeAction, this could be recursive
                        if (calledOnce) {
                            done(new Error('Callback called multiple times'));
                            return;
                        }
                        calledOnce = true;
                        throw testError;
                    };
                    actionContext.executeAction(action, payload, callback);
                });
            });

            it('should call executeAction callback with result', function (done) {
                var payload = {};
                var action = function (context, payload) {
                    return payload;
                };
                actionContext.executeAction(action, payload, function (err, result) {
                    expect(err).to.equal(null);
                    expect(result).to.equal(payload);
                    done();
                });
            });

            it('should reject promise if callback is called with first param', function (done) {
                var err = new Error();
                var action = function (context, payload, callback) {
                    callback(err);
                };
                actionContext.executeAction(action, {})
                .catch(function (callbackError) {
                    expect(callbackError).to.equal(err);
                    done();
                });
            });

            it('should resolve promise if callback is called with second param', function (done) {
                var payload = {};
                var action = function (context, payload, callback) {
                    callback(null, payload);
                };
                actionContext.executeAction(action, payload)
                .then(function (promiseResult) {
                    expect(promiseResult).to.equal(promiseResult);
                    done();
                }).catch(done);
            });

            it('should wait for returned promise', function (done) {
                var action = function (context, payload) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(payload);
                        }, 0);
                    }).catch(done);
                };
                var payload = {};
                actionContext.executeAction(action, payload)
                .then(function (result) {
                    expect(result).to.equal(payload);
                    done();
                }).catch(done);
            });

            it('should resolve promise with returned non-promise value', function (done) {
                var action = function (context, payload) {
                    return payload;
                };
                var payload = {};
                actionContext.executeAction(action, payload)
                .then(function (promiseResult) {
                    expect(promiseResult).to.equal(payload);
                    done();
                }).catch(done);
            });

            it('should reject promise with thrown error', function (done) {
                var err = new Error();
                var action = function (context, payload) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    throw err;
                };
                var payload = {};
                actionContext.executeAction(action, payload)
                .catch(function (actionError) {
                    expect(actionError).to.equal(err);
                    expect(actionCalls.length).to.equal(1);
                    expect(actionCalls[0].context).to.equal(actionContext);
                    expect(actionCalls[0].payload).to.equal(payload);
                    done();
                });
            });

            it('should not coerce non-objects', function (done) {
                var actionCalls = [];
                var action = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload,
                        callback: callback
                    });
                    callback();
                };
                var payload = false;
                actionContext.executeAction(action, payload, function () {
                    expect(actionCalls[0].payload).to.equal(false);
                    done();
                })
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
                    cb();
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
            dimensionsPluginSync = require('../../fixtures/plugins/DimensionsContextPluginSync'),
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
        it('should dehydrate and rehydrate the async plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(context.dehydrate()));
            expect(state).to.be.an('object');
            expect(state.dispatcher).to.be.an('object');
            expect(state.plugins).to.be.an('object');
            expect(state.plugins.DimensionsPlugin).to.be.an('object');
            expect(state.plugins.DimensionsPlugin.dimensions).to.deep.equal(dimensions);
            var newContext = app.createContext();
            newContext.plug(dimensionsPlugin());
            newContext.rehydrate(state, function (err) {
                if (err) {
                    done(err);
                }
                expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
                done();
            });
        });
        it('should dehydrate and rehydrate the sync plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(context.dehydrate()));
            expect(state).to.be.an('object');
            expect(state.dispatcher).to.be.an('object');
            expect(state.plugins).to.be.an('object');
            expect(state.plugins.DimensionsPlugin).to.be.an('object');
            expect(state.plugins.DimensionsPlugin.dimensions).to.deep.equal(dimensions);
            var newContext = app.createContext();
            newContext.plug(dimensionsPluginSync());
            newContext.rehydrate(state, function (err) {
                if (err) {
                    done(err);
                }
                expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
                done();
            });
        });
    });

});
