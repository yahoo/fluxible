var RouteStore = require('fluxible-router').RouteStore;
var routes = require('../configs/routes');

module.exports = RouteStore.withStaticRoutes(routes);
