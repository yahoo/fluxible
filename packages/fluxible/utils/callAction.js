/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';
var isPromise = require('is-promise');
require('setimmediate');

/**
 * Call an action supporting Promise expectations on invocation.
 *
 * If done callback supplied, that indicates non-Promise invocation expectation,
 * otherwise, Promise invocation.
 */
function callAction (actionContext, action, payload, done) {
    // Use a promise to force the action to be called async
    var executeActionPromise = Promise.resolve().then(function () {
        // Assume the action returns a promise since it doesn't take a callback
        if (action.length < 3) {
            return action(actionContext, payload);
        }

        // Return a nested promise to wrap the action invocation so its result
        // passed to its callback can be captured
        return new Promise(function (resolve, reject) {
            action(actionContext, payload, function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });

    if (done) {
        // Once our promise (and any nested promises) fully settle, call the
        // `done()` callback provided to us and pass either the result or error
        executeActionPromise
            .then(function (result) {
                done(null, result);
            }, done)
            ['catch'](function (err) {
                // Ensures that thrown errors in the `done()` callback above are
                // not swallowed by promise
                setImmediate(function () {
                    throw err;
                });
            });
    }

    // Finally return our original promise with the result of calling the action 
    return executeActionPromise;
}

module.exports = callAction;
