'use strict';

require('setimmediate');

/**
 * Execute a callback function when promise resolves or rejects
 * @method promiseCallback
 * @param {Promise} promise The promise
 * @param {Function} callbackFn The callback function
 * @param {Object} options The options object
 * @param {Boolean} options.optimize Whether to optimize
 * @return {void}
 */
function promiseCallback (promise, callbackFn, options) {
    if (!promise || typeof callbackFn !== 'function') {
        return;
    }

    if (options && options.optimize) {
        promise.then(function (result) {
            callbackFn(null, result);
        }, callbackFn)
        ['catch'](function (err) {
            // Ensures that thrown errors in the `callbackFn()` callback above are
            // not swallowed by promise
            setImmediate(function doNotSwallowError() {
                throw err;
            });
        });
    } else {
        promise.then(function(result) {
            // Ensures that errors in callback are not swallowed by promise
            setImmediate(callbackFn, null, result);
        }, function (err) {
            // Ensures that errors in callback are not swallowed by promise
            setImmediate(callbackFn, err);
        });
    }
};

module.exports = promiseCallback;
