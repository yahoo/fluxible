/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = function TestApplicationPlugin(initialFoo, initialBar) {
    var foo = initialFoo;
    var bar = initialBar;
    return {
        name: 'TestAppPlugin',
        plugContext: function (options) {
            return {
                plugActionContext: function plugActionContext(actionContext) {
                    actionContext.getFoo = function () {
                        return foo;
                    };
                    actionContext.getBar = function () {
                        return bar;
                    };
                },
                plugComponentContext: function plugComponentContext(
                    componentContext,
                ) {
                    componentContext.getFoo = function () {
                        return foo;
                    };
                },
                plugStoreContext: function plugStoreContext(storeContext) {
                    storeContext.getFoo = function () {
                        return foo;
                    };
                },
                dehydrate: function () {
                    return {
                        bar: bar,
                    };
                },
                rehydrate: function (state, done) {
                    return new Promise(function (resolve) {
                        bar = state.bar;
                        resolve();
                    });
                },
            };
        },
        dehydrate: function dehydrate() {
            return {
                foo: foo,
            };
        },
        rehydrate: function rehydrate(state) {
            return new Promise(function (resolve) {
                foo = state.foo;
                resolve();
            });
        },
    };
};
