/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

//@TODO(next minor) remove this file
var FluxibleComponent = require('../addons/FluxibleComponent');

if ('production' !== process.env.NODE_ENV) {
    var deprecateComponent = require('../utils/deprecateComponent');
    FluxibleComponent = deprecateComponent(
        FluxibleComponent,
        "require('fluxible').FluxibleComponent has been moved out of the " +
        "default exports for Fluxible. Please use " +
        "require('fluxible/addons/FluxibleComponent') instead."
    );
}

module.exports = FluxibleComponent;
