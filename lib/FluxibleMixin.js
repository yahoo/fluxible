/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

//@TODO(next minor) remove this file
var FluxibleMixin = require('../addons/FluxibleMixin');

if ('production' !== process.env.NODE_ENV) {
    var objectAssign = require('object-assign');
    FluxibleMixin = objectAssign({}, FluxibleMixin, {
        componentWillMount: function () {
            console.warn(
                "require('fluxible').FluxibleMixin has been moved out of the " +
                "default exports for Fluxible. Please use " +
                "require('fluxible/addons/FluxibleMixin') instead."
            );
        }
    });
}

module.exports = FluxibleMixin;
