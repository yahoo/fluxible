/**
 * Copyright 2016, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';
var expect = require('chai').expect;
var async = require('async');
var devToolsPlugin = require('../../../dist/lib/devtools-plugin')['default'];
var FluxibleApp = require('fluxible');

describe('devToolsPlugin', function () {
    var app,
        pluginInstance;

    beforeEach(function () {
        app = new FluxibleApp();
        pluginInstance = devToolsPlugin();
        app.plug(pluginInstance);
        context = app.createContext({
            debug: true
        });
    });

    describe('plugContext', function () {
        it('should be enabled based on debug flag', function () {
            var ctx;
            ctx = app.createContext();
            expect(ctx.dehydrate().plugins[pluginInstance.name].enableDebug).to.equal(false);
            ctx = app.createContext({debug: false});
            expect(ctx.dehydrate().plugins[pluginInstance.name].enableDebug).to.equal(false);
            ctx = app.createContext({debug: true});
            expect(ctx.dehydrate().plugins[pluginInstance.name].enableDebug).to.equal(true);
        });
    });

    describe('context', function () {
        it('should dehydrate context correctly', function () {
            const dehydrated = context.dehydrate().plugins[pluginInstance.name];
            expect(dehydrated).to.have.keys(['enableDebug', 'actionHistory']);
            expect(dehydrated)
                .to.have.property('enableDebug')
                .that.is.a('boolean');
            expect(dehydrated)
                .to.have.property('actionHistory')
                .that.is.an('array')
                .that.has.lengthOf(0);
        });
        it('should rehydrate correctly and override context upon rehydrating debug:true flag', function () {
            let ctx;
            ctx = app.createContext();
            expect(ctx.dehydrate().plugins[pluginInstance.name].enableDebug).to.equal(false);
            expect(ctx.dehydrate().plugins[pluginInstance.name].actionHistory).to.have.lengthOf(0);
            expect(ctx._createSubActionContext.name).to.equal('createSubActionContext');
            ctx.rehydrate({
                plugins: {
                    DevToolsPlugin: {
                        enableDebug: true,
                        actionHistory: [{name: 'navigateAction'}]
                    }
                }
            });
            expect(ctx.dehydrate().plugins[pluginInstance.name].enableDebug).to.equal(true);
            expect(ctx.dehydrate().plugins[pluginInstance.name].actionHistory).to.have.lengthOf(1);
            expect(ctx.dehydrate().plugins[pluginInstance.name].actionHistory[0].name).to.equal('navigateAction');
            expect(ctx._createSubActionContext.name).to.equal('createDevSubActionContext');
        });
    });

    describe('componentContext', function () {
        var componentContext;
        beforeEach(function() {
            componentContext = context.getComponentContext();
        })
        it('should plug componentContext with a devtools namespace', function () {
            expect(componentContext.devtools).to.be.an('object');
            expect(componentContext.devtools.getActionHistory).to.be.a('function');
        });
    });
    describe('Action History', function () {
        it('#getActionHistory should return array of actions', function() {
            const componentContext = context.getComponentContext();
            const actionContext = context.getActionContext();
            const getActionHistory = componentContext.devtools.getActionHistory;
            expect(getActionHistory()).to.be.an('array');
            expect(getActionHistory()).to.have.lengthOf(0);
            function MockActionFromComponent (ctx, payload, cb) {
                cb();
            }
            componentContext.executeAction(MockActionFromComponent);
            expect(getActionHistory()).to.be.an('array');
            expect(getActionHistory()).to.have.lengthOf(1);
            expect(getActionHistory()[0].name).to.equal(MockActionFromComponent.name);
            function MockActionFromAction (ctx, payload, cb) {
                cb();
            }
            actionContext.executeAction(MockActionFromAction);
            expect(getActionHistory()).to.be.an('array');
            expect(getActionHistory()).to.have.lengthOf(2);
            expect(getActionHistory()[0].name).to.equal(MockActionFromComponent.name);
            expect(getActionHistory()[1].name).to.equal(MockActionFromAction.name);
        });
        it('#getActionHistory actionContext nested executeAction', function (done) {
            var actionOne = function (context, payload, callback) {
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
                callback();
            };
            actionTwo.displayName = 'Two';
            var actionThree = function (context, payload, callback) {
                callback();
            };
            actionThree.displayName = 'Three';
            var actionFour = function (context, payload, callback) {
                context.executeAction(actionFive, payload, callback);
            };
            actionFour.displayName = 'Four';
            var actionFive = function (context, payload, callback) {
                callback();
            };
            actionFive.displayName = 'Five';
            var cb = function () {
                var expectedHeirarchy = {
                    name: 'One',
                    actionCalls: [{
                        name: 'Two'
                    },{
                        name: 'Two'
                    },{
                        name: 'Three'
                    }, {
                        name: 'Four',
                        actionCalls: [{
                            name: 'Five'
                        }]
                    }]
                };
                var heirarchy = context.getComponentContext().devtools.getActionHistory()[0];
                function compareHeirarchy(expected, actual) {
                    expect(actual).to.contain.keys(['name', 'startTime', 'endTime', 'duration', 'failed', 'rootId']);
                    expect(expected.name).to.equal(actual.name);
                    if (expected.actionCalls) {
                        expect(actual).to.contain.keys(['actionCalls']);
                        expect(expected.actionCalls.length).to.equal(actual.actionCalls.length);
                        expected.actionCalls.forEach((a,index) => {
                            compareHeirarchy(expected.actionCalls[index], actual.actionCalls[index]);
                        });
                    }
                }
                compareHeirarchy(expectedHeirarchy, heirarchy);
                done();
            }
            var actionContext = context.getActionContext();
            actionContext.executeAction(actionOne, {}, cb);
        });
        it('#getActionHistory componentContext nested executeAction', function (done) {
            var actionOne = function (context, payload, callback) {
                context.dispatch('ONE_START');
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
                    context.dispatch('ONE_STOP');
                    callback(err)
                });
            };
            actionOne.displayName = 'One';
            var actionTwo = function (context, payload, callback) {
                callback();
            };
            actionTwo.displayName = 'Two';
            var actionThree = function (context, payload, callback) {
                callback();
            };
            actionThree.displayName = 'Three';
            var actionFour = function (context, payload, callback) {
                context.executeAction(actionFive, payload, callback);
            };
            actionFour.displayName = 'Four';
            var actionFive = function (context, payload, callback) {
                context.dispatch('FIVE');
                callback();
            };
            actionFive.displayName = 'Five';
            var cb = function () {
                var expectedHeirarchy = {
                    name: 'One',
                    dispatchCalls: [{
                        name: 'ONE_START'
                    }, {
                        name: 'ONE_STOP'
                    }],
                    actionCalls: [{
                        name: 'Two'
                    },{
                        name: 'Two'
                    },{
                        name: 'Three'
                    }, {
                        name: 'Four',
                        actionCalls: [{
                            name: 'Five',
                            dispatchCalls: [{
                                name: 'FIVE'
                            }]
                        }]
                    }]
                };
                var heirarchy = context.getComponentContext().devtools.getActionHistory()[0];
                function compareHeirarchy(expected, actual) {
                    expect(actual).to.contain.keys(['name', 'startTime', 'endTime', 'duration', 'failed', 'rootId']);
                    expect(expected.name).to.equal(actual.name);
                    if (expected.dispatchCalls) {
                        expect(actual).to.contain.keys(['dispatchCalls']);
                        expect(expected.dispatchCalls.length).to.equal(actual.dispatchCalls.length);
                        expected.dispatchCalls.forEach((a,index) => {
                            expect(expected.dispatchCalls[index].name).to.equal(actual.dispatchCalls[index].name);
                        });
                    }
                    if (expected.actionCalls) {
                        expect(actual).to.contain.keys(['actionCalls']);
                        expect(expected.actionCalls.length).to.equal(actual.actionCalls.length);
                        expected.actionCalls.forEach((a,index) => {
                            compareHeirarchy(expected.actionCalls[index], actual.actionCalls[index]);
                        });
                    }
                }
                compareHeirarchy(expectedHeirarchy, heirarchy);
                done();
            }
            var componentContext = context.getComponentContext();
            componentContext.executeAction(actionOne, {});
            setTimeout(function() {
                cb();
            }, 1000);
        });
    })
});
