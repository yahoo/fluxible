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
    var displayName = action.displayName || action.name;
    var executeActionPromise = new Promise(function (resolve, reject) {
        setImmediate(function () {
            try {
                var syncResult = action(actionContext, payload, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
                if (isPromise(syncResult)) {
                    syncResult.then(resolve, reject);
                } else if (action.length < 3) {
                    resolve(syncResult);
                }
            } catch (e) {
                reject(e);
            }
        });
    });
    var startTime = Date.now();
    function actionEnd(failed) {
        var endTime = Date.now();
        var dur = endTime - startTime;
        var parent = actionContext.__parentAction;
        parent.startTime = startTime;
        parent.endTime = endTime;
        parent.duration = dur;
        parent.failed = !!failed;
    }
    executeActionPromise.then(
        function (v) {
            actionEnd();
            return v;
        },
        function (e) {
            actionEnd(true);
            throw e;
        });

    if (done) {
        executeActionPromise
            .then(function(result) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(done, null, result);
            }, function (err) {
                // Ensures that errors in callback are not swallowed by promise
                setImmediate(done, err);
            });
    }

    return executeActionPromise;
}

module.exports = callAction;
