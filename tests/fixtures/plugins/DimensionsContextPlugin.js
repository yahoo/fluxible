/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = function (dims) {
    var dimensions = dims;
    return {
        name: 'DimensionsPlugin',
        plugActionContext: function (actionContext, context, app) {
            actionContext.getDimensions = function () {
                return dimensions;
            };
        },
        plugComponentContext: function (componentContext, context, app) {
            componentContext.getDimensions = function () {
                return dimensions;
            };
        },
        plugStoreContext: function (storeContext, context, app) {
            storeContext.getDimensions = function () {
                return dimensions;
            };
        },
        dehydrate: function (context, app) {
            return {
                dimensions: dimensions
            };
        },
        rehydrate: function (state, context, app) {
            dimensions = state.dimensions;
        }
    }
};
