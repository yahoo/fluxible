/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = function TestApplicationPlugin(initialFoo) {
    var foo = initialFoo;
    return {
        name: 'TestAppPlugin',
        plugContext: function (options) {
            return {
                plugActionContext: function plugActionContext(actionContext) {
                    actionContext.getFoo = function () {
                        return foo;
                    };
                },
                plugComponentContext: function plugComponentContext(componentContext) {
                    componentContext.getFoo = function () {
                        return foo;
                    };
                },
                plugStoreContext: function plugStoreContext(storeContext) {
                    storeContext.getFoo = function () {
                        return foo;
                    };
                }
            };
        },
        dehydrate: function dehydrate() {
            return {
                foo: foo
            };
        },
        rehydrate: function rehydrate(state) {
            foo = state.foo;
        }
    }
};
