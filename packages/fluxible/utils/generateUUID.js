/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

/*
 * Generate a GUID for keeping track of a
 * transaction of actions and dispatches.
 * Reference: https://github.com/facebook/react/blob/a48ffb04dcfe4d6f832207618a8b39e3034bd413/src/renderers/dom/server/ServerReactRootIndex.js
 */
var GLOBAL_UUID_MAX = Math.pow(2, 53);

module.exports = function generateUUID () {
    return Math.ceil(Math.random() * GLOBAL_UUID_MAX);
}
