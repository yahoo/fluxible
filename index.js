/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
module.exports = require('./lib/Fluxible');
module.exports.FluxibleMixin = require('./mixins/FluxibleMixin');
module.exports.FluxibleComponent = require('./lib/FluxibleComponent');

// @todo: deprecate
module.exports.Mixin = module.exports.FluxibleMixin;
