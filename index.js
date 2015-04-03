/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var Fluxible = require('./lib/Fluxible');
Fluxible.Fluxible = require('./lib/Fluxible');
Fluxible.contextTypes = require('./lib/contextTypes');

// DEPRECATIONS
// @TODO(next minor): remove all deprecations
Fluxible.FluxibleComponent = require('./lib/FluxibleComponent');
Fluxible.FluxibleMixin = require('./lib/FluxibleMixin');

module.exports = Fluxible;
