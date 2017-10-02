/*globals describe,it,beforeEach */
'use strict';

var expect = require('chai').expect;
var async = require('async');
var Fluxible = require('../../../');
var FluxibleContext = require('../../../lib/FluxibleContext');
var isPromise = require('is-promise');
var createStore = require('dispatchr/addons/createStore');
var domain = require('domain');
var es6Promise = require('es6-promise').Promise;

var MockComponent = function () {};
MockComponent.displayName = 'Application';

describe('FluxibleContext', function () {
    var app;
    var context;

    beforeEach(function () {
        app = new Fluxible({
            component: MockComponent
        });
        context = app.createContext();
    });

    describe('getComponent', function () {
        it('should return the app component', function () {
            expect(context.getComponent()).to.equal(MockComponent);
        });
    });

    describe('getStore', function () {
        it('should provide access to registered store instance', function () {
            var store = createStore({
                storeName: 'TestStore'
            });

            app.registerStore(store);

            var context = app.createContext();

            var storeInstance = context.getStore(store);
            expect(storeInstance).to.be.an('object');
            expect(storeInstance.constructor.storeName).to.equal(store.storeName);
        });
    });

    describe('actionContext', function () {
        var actionContext;
        var actionCalls;
        beforeEach(function () {
            actionContext = context.getActionContext();
            actionCalls = [];
        });
        describe('#executeAction', function () {
            it('should return a promise', function (done) {
                var promise = actionContext.executeAction(function () {}, {})['catch'](done);
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
                    })['catch'](done);
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
                    expect(actionCalls[0].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[0].payload).to.equal(payload);
                    done();
                };
                actionContext.executeAction(action, payload, callback);
            });

            it('should trace executeAction calls and pass `id` along', function (done) {
                var actionOne = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    async.series([
                        function (cb) {
                            context.executeAction(actionTwo, payload, function actionOneFirstCallback () {
                                context.executeAction(actionTwo, payload, function actionOneSecondCallback () {
                                    cb();
                                });
                            });
                        },
                        function (cb) {
                            context.executeAction(actionThree, payload, function actionOneThirdcallback () {
                                cb();
                            });
                        },
                        async.apply(context.executeAction, actionFour, payload)
                    ], function (err) {
                        callback(err)
                    });
                };
                actionOne.displayName = 'One';
                var actionTwo = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                actionTwo.displayName = 'Two';
                var actionThree = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                actionThree.displayName = 'Three';
                var actionFour = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    context.executeAction(actionFive, payload, callback);
                };
                actionFour.displayName = 'Four';
                var actionFive = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                actionFive.displayName = 'Five';
                var payload = {};
                var callback = function () {
                    expect(actionCalls.length).to.equal(6);
                    expect(actionCalls[0].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[0].context).to.contain.keys(['rootId','stack']);
                    var firstId = actionCalls[0].context.rootId;
                    expect(actionCalls[0].context.stack.join('.')).to.equal('One');
                    expect(actionCalls[0].payload).to.equal(payload);
                    expect(actionCalls[1].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[1].context).to.contain.keys(['rootId','stack']);
                    expect(actionCalls[1].context.rootId).to.equal(firstId);
                    expect(actionCalls[1].context.stack.join('.')).to.equal('One.Two');
                    expect(actionCalls[1].payload).to.equal(payload);
                    expect(actionCalls[2].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[2].context).to.contain.keys(['rootId','stack']);
                    expect(actionCalls[2].context.rootId).to.equal(firstId);
                    expect(actionCalls[2].context.stack.join('.')).to.equal('One.Two');
                    expect(actionCalls[2].payload).to.equal(payload);
                    expect(actionCalls[3].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[3].context).to.contain.keys(['rootId','stack']);
                    expect(actionCalls[3].context.rootId).to.equal(firstId);
                    expect(actionCalls[3].context.stack.join('.')).to.equal('One.Three');
                    expect(actionCalls[3].payload).to.equal(payload);
                    expect(actionCalls[4].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[4].context).to.contain.keys(['rootId','stack']);
                    expect(actionCalls[4].context.rootId).to.equal(firstId);
                    expect(actionCalls[4].context.stack.join('.')).to.equal('One.Four');
                    expect(actionCalls[4].payload).to.equal(payload);
                    expect(actionCalls[5].context).to.contain.keys(Object.keys(actionContext));
                    expect(actionCalls[5].context).to.contain.keys(['rootId','stack']);
                    expect(actionCalls[5].context.rootId).to.equal(firstId);
                    expect(actionCalls[5].context.stack.join('.')).to.equal('One.Four.Five');
                    expect(actionCalls[5].payload).to.equal(payload);
                    done();
                };
                actionContext = context.getActionContext();
                actionContext.executeAction(actionOne, payload, callback);
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

            // Broken due to domain and Promise interaction in node 4+
            it('should not swallow callback errors', function (done) {
                // Use polyfilled Promise due to issue with Promises and domains
                // See https://github.com/nodejs/node-v0.x-archive/issues/8648
                var oldPromise = global.Promise;
                global.Promise = es6Promise;

                // Error is expected, but will not be catchable. Crudely using domain.
                var testError = new Error('test');
                var d = domain.create();
                d.on('error', function (e) {
                    expect(e).to.equal(testError);
                    d.exit();
                    done();
                    global.Promise = oldPromise;
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
                ['catch'](function (callbackError) {
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
                    })['catch'](done);
            });

            it('should wait for returned promise', function (done) {
                var action = function (context, payload) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(payload);
                        }, 0);
                    })['catch'](done);
                };
                var payload = {};
                actionContext.executeAction(action, payload)
                    .then(function (result) {
                        expect(result).to.equal(payload);
                        done();
                    })['catch'](done);
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
                    })['catch'](done);
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
                ['catch'](function (actionError) {
                    try {
                        expect(actionError).to.equal(err);
                        expect(actionCalls.length).to.equal(1);
                        expect(actionCalls[0].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[0].payload).to.equal(payload);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it('should execute the action asynchronously when using a callback', function (done) {
                var log = [];
                var action = function (context, payload, callback) {
                    log.push('action');
                    callback();
                };
                var payload = {};
                var callback = function () {
                    try {
                        expect(log).to.deep.equal(['start', 'after executeAction', 'action']);
                        done();
                    } catch (e) {
                        done(e);
                    }
                };
                log.push('start');
                actionContext.executeAction(action, payload, callback);
                log.push('after executeAction')
            });

            it('should execute the action asynchronously when using a promise', function (done) {
                var log = [];
                var action = function (context, payload) {
                    return new Promise(function (resolve) {
                        log.push('action');
                        resolve();
                    });
                };
                var payload = {};

                log.push('start');
                actionContext.executeAction(action, payload)
                    .then(function () {
                        try {
                            expect(log).to.deep.equal(['start', 'after executeAction', 'action']);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                log.push('after executeAction')
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
                });
            });

            describe('simultaneous actions', function () {
                var originalWarn;
                var warningCalls;

                var store;

                beforeEach(function () {

                    originalWarn = console.warn;
                    warningCalls = [];
                    console.warn = function () {
                        warningCalls.push(Array.prototype.slice.call(arguments));
                    };

                    store = createStore({

                        storeName: 'TestStore',

                        handlers: {
                            'TEST': function () {
                                this.emitChange();
                            }
                        }
                    });

                    app.registerStore(store);
                });

                afterEach(function () {
                    console.warn = originalWarn;
                });

                it('should output a warning when an action is currently being dispatched', function (done) {

                    var action1ExecuteCount = 0;
                    var action2ExecuteCount = 0;
                    var payload = {};

                    var action1 = function action1(context, payload, callback) {
                        context.dispatch('TEST', payload);
                        action1ExecuteCount++;

                        callback();
                    };

                    var action2 = function action2(context, payload, callback) {
                        action2ExecuteCount++;
                        callback()
                    };

                    var storeInstance = actionContext.getStore(store);
                    storeInstance.addChangeListener(function () {
                        actionContext.executeAction(action2, payload, function () {
                            try {
                                expect(warningCalls.length).to.equal(1);
                                expect(warningCalls[0][0]).to.equal('Warning: executeAction for `action2` was ' +
                                'called, but `TEST` is currently being dispatched. This could mean there are ' +
                                'cascading updates, which should be avoided. `action2` will only start after ' +
                                '`TEST` is complete.');
                                expect(action1ExecuteCount).to.equal(1);
                                expect(action2ExecuteCount).to.equal(1);
                                done();
                            } catch (e) {
                                done(e);
                            }
                        });
                    });

                    actionContext.executeAction(action1)

                });
            });
        });
    });

    describe('componentContext', function () {
        var componentContext;
        beforeEach(function () {
            componentContext = context.getComponentContext();
        });
        describe('#executeAction', function () {
            it('should execute the action', function (done) {
                var oldWarn = console.warn;
                console.warn = function () {};
                try {
                    var callback = function () {
                        throw new Error('This should not be called');
                    };
                    var action = function (actionContext, payload, cb) {
                        expect(actionContext).to.contain.keys(Object.keys(context.getActionContext()));
                        expect(payload).to.equal(payload);
                        expect(callback).to.not.equal(cb);
                        done();
                    };
                    var payload = {};
                    componentContext.executeAction(action, payload, callback);
                } finally {
                    console.warn = oldWarn;
                }
            });
            it('should trace executeAction calls and pass `id` along', function (done) {
                var actionContext = context.getActionContext();
                var actionCalls = [];
                var actionOne = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    async.series([
                        function (cb) {
                            context.executeAction(actionTwo, payload, function actionOneFirstCallback () {
                                context.executeAction(actionTwo, payload, function actionOneSecondCallback () {
                                    cb();
                                });
                            });
                        },
                        function (cb) {
                            context.executeAction(actionThree, payload, function actionOneThirdcallback () {
                                cb();
                            });
                        }
                    ], function (err) {
                        if (err) {
                            done(err);
                        }

                        expect(actionCalls.length).to.equal(5);
                        expect(actionCalls[0].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[0].context).to.contain.keys(['rootId','stack']);
                        var firstId = actionCalls[0].context.rootId;
                        expect(actionCalls[0].context.stack.join('.')).to.equal('One');
                        expect(actionCalls[0].payload).to.equal(payload);
                        expect(actionCalls[1].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[1].context).to.contain.keys(['rootId','stack']);
                        expect(actionCalls[1].context.rootId).to.equal(firstId);
                        expect(actionCalls[1].context.stack.join('.')).to.equal('One.Two');
                        expect(actionCalls[1].payload).to.equal(payload);
                        expect(actionCalls[2].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[2].context).to.contain.keys(['rootId','stack']);
                        expect(actionCalls[2].context.rootId).to.equal(firstId);
                        expect(actionCalls[2].context.stack.join('.')).to.equal('One.Two');
                        expect(actionCalls[2].payload).to.equal(payload);
                        expect(actionCalls[3].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[3].context).to.contain.keys(['rootId','stack']);
                        expect(actionCalls[3].context.rootId).to.equal(firstId);
                        expect(actionCalls[3].context.stack.join('.')).to.equal('One.Three');
                        expect(actionCalls[3].payload).to.equal(payload);
                        expect(actionCalls[4].context).to.contain.keys(Object.keys(actionContext));
                        expect(actionCalls[4].context).to.contain.keys(['rootId','stack']);
                        expect(actionCalls[4].context.rootId).to.equal(firstId);
                        expect(actionCalls[4].context.stack.join('.')).to.equal('One.Three.Four');
                        expect(actionCalls[4].payload).to.equal(payload);
                        done();
                    });
                };
                actionOne.displayName = 'One';
                var actionTwo = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                actionTwo.displayName = 'Two';
                var actionThree = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    context.executeAction(actionFour, payload, callback);
                };
                actionThree.displayName = 'Three';
                var actionFour = function (context, payload, callback) {
                    actionCalls.push({
                        context: context,
                        payload: payload
                    });
                    callback();
                };
                actionFour.displayName = 'Four';
                var payload = {};
                componentContext.executeAction(actionOne, payload);
            });
            it('should use the defined component action handler', function (done) {
                var actionError = new Error('something went wrong');
                var myActionHandler = function (context, payload, cb) {
                    expect(payload.err).to.equal(actionError);
                    cb();
                    done();
                };
                var app2 = new Fluxible({
                    component: MockComponent,
                    componentActionErrorHandler: myActionHandler
                });
                var context2 = app2.createContext();
                var componentContext2 = context2.getComponentContext();
                var action = function (context, payload, cb) {
                    cb(actionError);
                };

                componentContext2.executeAction(action, {});
            });

            it('throws if component action handler does not handle the error', function (done) {
                // Use polyfilled Promise due to issue with Promises and domains
                // See https://github.com/nodejs/node-v0.x-archive/issues/8648
                var oldPromise = global.Promise;
                global.Promise = es6Promise;

                var actionError = new Error('action error');
                var d = domain.create();
                d.on('error', function (e) {
                    expect(e).to.equal(actionError);
                    d.exit();
                    done();
                    global.Promise = oldPromise;
                });
                d.run(function () {
                    var componentActionErrorHandler = function (context, payload) {
                        throw payload.err;
                    };
                    var action = function () {
                        throw actionError;
                    };
                    var app2 = new Fluxible({
                        componentActionErrorHandler: componentActionErrorHandler
                    });
                    var context2 = app2.createContext();
                    var componentContext2 = context2.getComponentContext();
                    componentContext2.executeAction(action, {});
                });
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
                component: MockComponent
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
            dimensionsPluginPromise = require('../../fixtures/plugins/DimensionsContextPluginPromise'),
            dimensions = {
                foo: 'bar'
            };
        beforeEach(function () {
            context.plug(dimensionsPlugin(dimensions));
        });
        it('should throw if the plugin does not have a name', function () {
            expect(function () {
                context.plug({});
            }).to['throw']();
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
        it('#plug should collect list of executeActionPlugins', function () {
            var newContext = app.createContext();
            expect(newContext._executeActionPlugins).to.have.lengthOf(0);
            var plugin = {
                name: 'plugin',
                plugExecuteAction: function plugExecuteAction() {}
            };
            newContext.plug(plugin);
            expect(newContext._executeActionPlugins).to.have.lengthOf(1);
        });
        it('should call executeActionPlugins', function (done) {
            var newContext = app.createContext();
            var modifiedActionCalled = false;
            var modifiedCallbackCalled = false;
            var plugin = {
                name: 'plugin',
                plugExecuteAction: function plugExecuteAction(args) {
                    return {
                        action: function modifiedAction(context, payload, callback) {
                            modifiedActionCalled = true;
                            args.action(context, payload, callback);
                        },
                        actionContext: Object.assign(args.actionContext, {modified: true}),
                        payload: Object.assign(args.payload, {modified: true}),
                        done: function modifedCallback(err) {
                            modifiedCallbackCalled = true;
                            args.done && args.done(err);
                        }
                    }
                }
            };
            var contextModified = false;
            var payloadModified = false;
            newContext.plug(plugin);
            var action = function (context, payload, callback) {
                if (context && context.modified) {
                    contextModified = true;
                }
                if (payload && payload.modified) {
                    payloadModified = true;
                }
                callback();
            };
            newContext.executeAction(action, {}, function end () {
                var err = null;
                try {
                    expect(modifiedActionCalled).to.equal(true);
                    expect(contextModified).to.equal(true);
                    expect(payloadModified).to.equal(true);
                    expect(modifiedCallbackCalled).to.equal(true);
                } catch (e) {
                    err = e;
                } finally {
                    done(err);
                }

            });
        })
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
            var rehydratePromise = newContext.rehydrate(state).then(function () {
                expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
                done();
            }, done);
            expect(isPromise(rehydratePromise));
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
            var rehydratePromise = newContext.rehydrate(state).then(function () {
                expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
                done();
            }, done);
            expect(isPromise(rehydratePromise));
        });
        it('should dehydrate and rehydrate the promise plugin correctly', function (done) {
            // Create a copy of the state
            var state = JSON.parse(JSON.stringify(context.dehydrate()));
            expect(state).to.be.an('object');
            expect(state.dispatcher).to.be.an('object');
            expect(state.plugins).to.be.an('object');
            expect(state.plugins.DimensionsPlugin).to.be.an('object');
            expect(state.plugins.DimensionsPlugin.dimensions).to.deep.equal(dimensions);
            var newContext = app.createContext();
            newContext.plug(dimensionsPluginPromise());
            var rehydratePromise = newContext.rehydrate(state).then(function () {
                expect(newContext.getActionContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getComponentContext().getDimensions()).to.deep.equal(dimensions);
                expect(newContext.getStoreContext().getDimensions()).to.deep.equal(dimensions);
                done();
            }, done);
            expect(isPromise(rehydratePromise));
        });
    });

});
