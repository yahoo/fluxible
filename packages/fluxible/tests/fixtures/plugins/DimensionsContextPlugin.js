/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = function (dims) {
    var dimensions = dims;
    return {
        name: 'DimensionsPlugin',
        plugActionContext: function (actionContext) {
            actionContext.getDimensions = function () {
                return dimensions;
            };
        },
        plugComponentContext: function (componentContext) {
            componentContext.getDimensions = function () {
                return dimensions;
            };
        },
        plugStoreContext: function (storeContext) {
            storeContext.getDimensions = function () {
                return dimensions;
            };
        },
        dehydrate: function () {
            return {
                dimensions: dimensions,
            };
        },
        rehydrate: function (state, done) {
            dimensions = state.dimensions;
            setImmediate(done);
        },
    };
};
