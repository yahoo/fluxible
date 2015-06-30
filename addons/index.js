/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

module.exports = {
    BaseStore: require('./BaseStore'),
    createStore: require('./createStore')
};

// Deprecated support
var objectAssign = require('object-assign');
var movedMethods = {
    connectToStores: require('fluxible-addons-react/connectToStores'),
    createElementWithContext: require('fluxible-addons-react/createElementWithContext'),
    FluxibleComponent: require('fluxible-addons-react/FluxibleComponent'),
    FluxibleMixin: require('fluxible-addons-react/FluxibleMixin'),
    provideContext: require('fluxible-addons-react/provideContext')
};
if (process.env.NODE_ENV === 'production') {
    objectAssign(module.exports, movedMethods);
} else {
    Object.keys(movedMethods).forEach(function (methodName) {
        var warnedOnce = false;
        Object.defineProperty(module.exports, methodName, {
            get: function () {
                if (!warnedOnce) {
                    console.warn('`' + methodName + '` has moved to the ' +
                        '`fluxible-addons-react` package.');
                    warnedOnce = true;
                }
                return movedMethods[methodName];
            }
        });
    });
}
