/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var inherits = require('inherits');
var BaseStore = require('./BaseStore');
var IGNORE_ON_PROTOTYPE = ['statics', 'storeName', 'handlers', 'mixins'];

function createChainedFunction(one, two) {
    return function chainedFunction() {
        one.apply(this, arguments);
        two.apply(this, arguments);
    };
}

function mixInto(dest, src) {
    Object.keys(src).forEach(function (prop) {
        if (-1 !== IGNORE_ON_PROTOTYPE.indexOf(prop)) {
            return;
        }
        if ('initialize' === prop) {
            if (!dest[prop]) {
                dest[prop] = src[prop];
            } else {
                dest[prop] = createChainedFunction(dest[prop], src[prop]);
            }
        } else {
            if (dest.hasOwnProperty(prop)) {
                throw new Error('Mixin property collision for property "' + prop + '"');
            }
            dest[prop] = src[prop];
        }
    });
}

/**
 * Helper for creating a store class
 * @method createStore
 * @param {Object} spec
 * @param {String} spec.storeName The name of the store
 * @param {Object} spec.handlers Hash of action name to method name of action handlers
 * @param {Function} spec.initialize Function called during construction for setting the default state
 * @param {Function} spec.dehydrate Function that returns serializable data to send to the client
 * @param {Function} spec.rehydrate Function that takes in serializable data to rehydrate the store
 */
module.exports = function createStore(spec) {
    spec.statics = spec.statics || {};
    if (!spec.storeName && !spec.statics.storeName) {
        throw new Error('createStore called without a storeName');
    }
    var Store = function (dispatcher) {
        BaseStore.call(this, dispatcher);
    };

    inherits(Store, BaseStore);

    Object.keys(spec.statics).forEach(function (prop) {
        Store[prop] = spec.statics[prop];
    });

    Store.storeName = spec.storeName || Store.storeName;
    Store.handlers = spec.handlers || Store.handlers;
    Store.mixins = spec.mixins || Store.mixins;

    if (Store.mixins) {
        Store.mixins.forEach(function(mixin) {
            mixInto(Store.prototype, mixin);
        });
    }
    mixInto(Store.prototype, spec);

    return Store;
};
