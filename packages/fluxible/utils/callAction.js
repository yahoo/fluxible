/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */
'use strict';
var isPromise = require('is-promise');

/**
 * Call an action supporting Promise expectations on invocation.
 *
 * If done callback supplied, that indicates non-Promise invocation expectation,
 * otherwise, Promise invocation.
 */
function callAction (action, context, payload, done) {
  if (typeof action !== 'function') {
    throw new Error('An action need to be a function');
  }

  if (done) {
    return action(context, payload, done);
  }

  return new Promise(function (resolve, reject) {
    try {
      var syncResult = action(context, payload, function (err, result) {
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
}

module.exports = callAction;
