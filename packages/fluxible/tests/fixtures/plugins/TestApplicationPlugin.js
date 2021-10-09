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
                    componentContext
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
                    bar = state.bar;
                    setImmediate(done);
                },
            };
        },
        dehydrate: function dehydrate() {
            return {
                foo: foo,
            };
        },
        rehydrate: function rehydrate(state, done) {
            foo = state.foo;
            setImmediate(done);
        },
    };
};
