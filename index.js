/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = module.exports.Fluxible = require('./lib/Fluxible');
module.exports.FluxibleMixin = require('./lib/FluxibleMixin');
module.exports.FluxibleComponent = require('./lib/FluxibleComponent');

// Deprecated
var objectAssign = require('object-assign');
module.exports.Mixin = objectAssign({}, require('./lib/FluxibleMixin'), {
    componentWillMount: function () {
        console.warn("require('fluxible').Mixin is deprecated. Please use " +
        "require('fluxible').FluxibleMixin.");
    }
});
