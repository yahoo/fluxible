/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var dispatchr = require('dispatchr');
var MockActionContextClass = require('./MockActionContext');

module.exports = function createMockActionContext(options) {
    options = options || {};
    options.mockActionContextClass = options.mockActionContextClass || MockActionContextClass;
    options.stores = options.stores || [];
    options.dispatcher = options.dispatcher || dispatchr.createDispatcher({
        stores: options.stores
    });
    options.dispatcherContext = options.dispatcherContext || options.dispatcher.createContext();

    return new options.mockActionContextClass(options.dispatcherContext);
};
