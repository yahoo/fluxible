/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var batchedUpdates = require('react-dom').unstable_batchedUpdates;

module.exports = function createBatchedUpdatePlugin(options) {
    /**
     * @class BatchedUpdatePlugin
     */
    return {
        name: 'BatchedUpdatePlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @returns {Object}
         */
        plugContext: function plugContext() {
            return {
                /**
                 * Provides full access to the router in the action context
                 * @param {Object} actionContext
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    var oldDispatch = actionContext.dispatch;
                    actionContext.dispatch = function () {
                        var args = arguments;
                        batchedUpdates(function () {
                            oldDispatch.apply(actionContext, args);
                        });
                    };
                }
            };
        }
    };
};
