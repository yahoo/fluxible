/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
const { unstable_batchedUpdates } = require('react-dom');

function createBatchedUpdatePlugin() {
    /**
     * @class BatchedUpdatePlugin
     */
    return {
        name: 'BatchedUpdatePlugin',

        plugContext() {
            return {
                plugActionContext(actionContext) {
                    const oldDispatch = actionContext.dispatch;
                    actionContext.dispatch = (...args) => {
                        unstable_batchedUpdates(() => { oldDispatch.apply(actionContext, args); });
                    };
                }
            };
        }
    };
}

module.exports = createBatchedUpdatePlugin;
