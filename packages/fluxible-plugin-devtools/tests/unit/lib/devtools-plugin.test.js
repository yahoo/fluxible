/**
 * Copyright 2016, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*globals describe,it,beforeEach */
'use strict';
var async = require('async');
var devToolsPlugin = require('../../../dist/lib/devtools-plugin').default;
var FluxibleApp = require('fluxible');

describe('devToolsPlugin', function () {
    let app;
    let pluginInstance;
    let context;

    beforeEach(function () {
        app = new FluxibleApp();
        pluginInstance = devToolsPlugin();
        app.plug(pluginInstance);
        context = app.createContext({
            debug: true,
        });
    });

    describe('plugContext', function () {
        it('should be enabled based on debug flag', function () {
            var ctx;
            ctx = app.createContext();
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].enableDebug,
            ).toEqual(false);
            ctx = app.createContext({ debug: false });
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].enableDebug,
            ).toEqual(false);
            ctx = app.createContext({ debug: true });
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].enableDebug,
            ).toEqual(true);
        });
    });

    describe('context', function () {
        it('should dehydrate context correctly', function () {
            const dehydrated = context.dehydrate().plugins[pluginInstance.name];
            expect(dehydrated.enableDebug).toBe(true);
            expect(dehydrated.actionHistory).toHaveLength(0);
        });

        it('should rehydrate correctly and override context upon rehydrating debug:true flag', function () {
            let ctx;
            ctx = app.createContext();
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].enableDebug,
            ).toEqual(false);
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].actionHistory,
            ).toHaveLength(0);
            expect(ctx._createSubActionContext.name).toEqual(
                'createSubActionContext',
            );
            ctx.rehydrate({
                plugins: {
                    DevToolsPlugin: {
                        enableDebug: true,
                        actionHistory: [{ name: 'navigateAction' }],
                    },
                },
            });
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].enableDebug,
            ).toEqual(true);
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].actionHistory,
            ).toHaveLength(1);
            expect(
                ctx.dehydrate().plugins[pluginInstance.name].actionHistory[0]
                    .name,
            ).toEqual('navigateAction');
            expect(ctx._createSubActionContext.name).toEqual(
                'createDevSubActionContext',
            );
        });
    });

    describe('componentContext', function () {
        var componentContext;

        beforeEach(function () {
            componentContext = context.getComponentContext();
        });

        it('should plug componentContext with a devtools namespace', function () {
            expect(componentContext.devtools).toBeInstanceOf(Object);
            expect(componentContext.devtools.getActionHistory).toBeInstanceOf(
                Function,
            );
        });
    });
    describe('Action History', function () {
        it('#getActionHistory should return array of actions', function () {
            const componentContext = context.getComponentContext();
            const actionContext = context.getActionContext();
            const getActionHistory = componentContext.devtools.getActionHistory;
            expect(Array.isArray(getActionHistory())).toBe(true);
            expect(getActionHistory()).toHaveLength(0);
            function MockActionFromComponent(ctx, payload, cb) {
                cb();
            }
            componentContext.executeAction(MockActionFromComponent);
            expect(Array.isArray(getActionHistory())).toBe(true);
            expect(getActionHistory()).toHaveLength(1);
            expect(getActionHistory()[0].name).toEqual(
                MockActionFromComponent.name,
            );
            function MockActionFromAction(ctx, payload, cb) {
                cb();
            }
            actionContext.executeAction(MockActionFromAction);
            expect(Array.isArray(getActionHistory())).toBe(true);
            expect(getActionHistory()).toHaveLength(2);
            expect(getActionHistory()[0].name).toEqual(
                MockActionFromComponent.name,
            );
            expect(getActionHistory()[1].name).toEqual(
                MockActionFromAction.name,
            );
        });

        it('#getActionHistory actionContext nested executeAction', function (done) {
            var actionOne = function (context, payload, callback) {
                async.series(
                    [
                        function (cb) {
                            context.executeAction(
                                actionTwo,
                                payload,
                                function actionOneFirstCallback() {
                                    context.executeAction(
                                        actionTwo,
                                        payload,
                                        function actionOneSecondCallback() {
                                            cb();
                                        },
                                    );
                                },
                            );
                        },
                        function (cb) {
                            context.executeAction(
                                actionThree,
                                payload,
                                function actionOneThirdcallback() {
                                    cb();
                                },
                            );
                        },
                        async.apply(context.executeAction, actionFour, payload),
                    ],
                    function (err) {
                        callback(err);
                    },
                );
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
                    actionCalls: [
                        {
                            name: 'Two',
                        },
                        {
                            name: 'Two',
                        },
                        {
                            name: 'Three',
                        },
                        {
                            name: 'Four',
                            actionCalls: [
                                {
                                    name: 'Five',
                                },
                            ],
                        },
                    ],
                };
                var heirarchy = context
                    .getComponentContext()
                    .devtools.getActionHistory()[0];
                function compareHeirarchy(expected, actual) {
                    expect(actual).toEqual(
                        expect.objectContaining({
                            name: expect.anything(),
                            startTime: expect.anything(),
                            endTime: expect.anything(),
                            duration: expect.anything(),
                            failed: expect.anything(),
                            rootId: expect.anything(),
                        }),
                    );
                    expect(expected.name).toEqual(actual.name);
                    if (expected.actionCalls) {
                        expect(actual).toEqual(
                            expect.objectContaining({
                                actionCalls: expect.any(Array),
                            }),
                        );
                        expect(expected.actionCalls.length).toEqual(
                            actual.actionCalls.length,
                        );
                        expected.actionCalls.forEach((a, index) => {
                            compareHeirarchy(
                                expected.actionCalls[index],
                                actual.actionCalls[index],
                            );
                        });
                    }
                }
                compareHeirarchy(expectedHeirarchy, heirarchy);
                done();
            };
            var actionContext = context.getActionContext();
            actionContext.executeAction(actionOne, {}, cb);
        });

        it('#getActionHistory componentContext nested executeAction', function (done) {
            var actionOne = function (context, payload, callback) {
                context.dispatch('ONE_START');
                async.series(
                    [
                        function (cb) {
                            context.executeAction(
                                actionTwo,
                                payload,
                                function actionOneFirstCallback() {
                                    context.executeAction(
                                        actionTwo,
                                        payload,
                                        function actionOneSecondCallback() {
                                            cb();
                                        },
                                    );
                                },
                            );
                        },
                        function (cb) {
                            context.executeAction(
                                actionThree,
                                payload,
                                function actionOneThirdcallback() {
                                    cb();
                                },
                            );
                        },
                        async.apply(context.executeAction, actionFour, payload),
                    ],
                    function (err) {
                        context.dispatch('ONE_STOP');
                        callback(err);
                    },
                );
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
                    dispatchCalls: [
                        {
                            name: 'ONE_START',
                        },
                        {
                            name: 'ONE_STOP',
                        },
                    ],
                    actionCalls: [
                        {
                            name: 'Two',
                        },
                        {
                            name: 'Two',
                        },
                        {
                            name: 'Three',
                        },
                        {
                            name: 'Four',
                            actionCalls: [
                                {
                                    name: 'Five',
                                    dispatchCalls: [
                                        {
                                            name: 'FIVE',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                };
                var heirarchy = context
                    .getComponentContext()
                    .devtools.getActionHistory()[0];
                function compareHeirarchy(expected, actual) {
                    expect(actual).toEqual(
                        expect.objectContaining({
                            name: expect.anything(),
                            startTime: expect.anything(),
                            endTime: expect.anything(),
                            duration: expect.anything(),
                            failed: expect.anything(),
                            rootId: expect.anything(),
                        }),
                    );
                    expect(expected.name).toEqual(actual.name);
                    if (expected.dispatchCalls) {
                        expect(actual).toEqual(
                            expect.objectContaining({
                                dispatchCalls: expect.any(Array),
                            }),
                        );
                        expect(expected.dispatchCalls.length).toEqual(
                            actual.dispatchCalls.length,
                        );
                        expected.dispatchCalls.forEach((a, index) => {
                            expect(expected.dispatchCalls[index].name).toEqual(
                                actual.dispatchCalls[index].name,
                            );
                        });
                    }
                    if (expected.actionCalls) {
                        expect(actual).toEqual(
                            expect.objectContaining({
                                actionCalls: expect.any(Array),
                            }),
                        );
                        expect(expected.actionCalls.length).toEqual(
                            actual.actionCalls.length,
                        );
                        expected.actionCalls.forEach((a, index) => {
                            compareHeirarchy(
                                expected.actionCalls[index],
                                actual.actionCalls[index],
                            );
                        });
                    }
                }
                compareHeirarchy(expectedHeirarchy, heirarchy);
                done();
            };
            var componentContext = context.getComponentContext();
            componentContext.executeAction(actionOne, {});
            setTimeout(function () {
                cb();
            }, 1000);
        });
    });
});
