/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');
var MockComponentContextClass = require('./MockComponentContext');

module.exports = function createMockComponentContext(options) {
    options = options || {};
    options.mockComponentContextClass = options.mockComponentContextClass || MockComponentContextClass;
    options.stores = options.stores || [];
    options.dispatcher = options.dispatcher || dispatchr.createDispatcher({
        stores: options.stores
    });
    options.dispatcherContext = options.dispatcherContext || options.dispatcher.createContext();

    return new options.mockComponentContextClass(options.dispatcherContext);
};
