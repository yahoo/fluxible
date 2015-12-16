/**
 * Copyright 2014, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';
var debug = require('debug')('Fluxible:FetchrPlugin');
var DEFAULT_API_PATH = '/api';
var DEFAULT_XHR_TIMEOUT = 3000;
var Fetchr = require('fetchr');
var defaultConstructGetUri = require('fetchr/libs/util/defaultConstructGetUri');

/**
 * Creates a new fetchr plugin instance with options
 * @param {Object} options configuration options
 * @param {String} [options.xhrPath] The path for XHR requests
 * @param {Number} [options.xhrTimout] Timeout in milliseconds for all XHR requests
 * @param {Boolean} [options.corsPath] Base CORS path in case CORS is enabled
 * @param {Object} [options.xhrContext] The xhr context object
 * @param {Object} [options.contextPicker] The context picker for GET and POST, they must be
 *      lodash pick predicate function with three arguments (value, key, object)
 * @param {Function} [options.contextPicker.GET] GET context picker
 * @param {Function} [options.contextPicker.POST] POST context picker
 * @returns {FetchrPlugin}
 */
module.exports = function fetchrPlugin(options) {
    options = options || {};
    var xhrPath = options.xhrPath || DEFAULT_API_PATH;
    var xhrTimeout = options.xhrTimeout || DEFAULT_XHR_TIMEOUT;
    var corsPath = options.corsPath || null;

    /**
     * @class FetchrPlugin
     */
    return {
        /**
         * @property {String} name Name of the plugin
         */
        name: 'FetchrPlugin',
        /**
         * Called to plug the FluxContext
         * @method plugContext
         * @param {Object} contextOptions options passed to the createContext method
         * @param {Object} contextOptions.req The server request object (only supplied if on server)
         * @param {Object} contextOptions.xhrContext Context object that will be used for all
         *      XHR calls from the client. This allows persistence of some values between requests
         *      and also CSRF validation. (e.g. { _csrf: 'a3fc2f', device: "tablet" })
         * @returns {Object}
         */
        plugContext: function plugContext(contextOptions) {
            var xhrContext = contextOptions.xhrContext;
            if (options.getXhrPath) {
                xhrPath = options.getXhrPath(contextOptions);
            }
            return {
                /**
                 * Adds the service CRUD and getServiceMeta methods to the action context
                 * @param actionContext
                 */
                plugActionContext: function plugActionContext(actionContext) {
                    var uri;

                    var service = new Fetchr({
                        req: contextOptions.req,
                        xhrPath: xhrPath,
                        xhrTimeout: xhrTimeout,
                        corsPath: corsPath,
                        context: xhrContext,
                        contextPicker: options.contextPicker
                    });
                    actionContext.service = {
                        create: service.create.bind(service),
                        read: service.read.bind(service),
                        update: service.update.bind(service),
                        'delete': service.delete.bind(service),
                        constructGetXhrUri: function constructGetXhrUri(resource, params, config) {
                            config = config || {};
                            uri = config.cors ? corsPath : xhrPath;
                            var getUriFn = config.constructGetUri || defaultConstructGetUri;
                            return getUriFn.call(service, uri, resource, params, config, xhrContext);
                        },
                        updateOptions: function (options) {
                            xhrPath = options.xhrPath ? options.xhrPath : xhrPath;
                            xhrTimeout = options.xhrTimeout ? options.xhrTimeout : xhrTimeout;
                            corsPath = options.corsPath ? options.corsPath : corsPath;
                            service.updateOptions && service.updateOptions(options);
                        }
                    };
                    actionContext.getServiceMeta = service.getServiceMeta.bind(service);
                },
                /**
                 * Called to dehydrate plugin options
                 * @method dehydrate
                 * @returns {Object}
                 */
                dehydrate: function dehydrate() {
                    return {
                        xhrContext: contextOptions.xhrContext,
                        xhrPath: xhrPath,
                        xhrTimeout: xhrTimeout,
                        corsPath: corsPath
                    };
                },
                /**
                 * Called to rehydrate plugin options
                 * @method rehydrate
                 * @returns {Object}
                 */
                rehydrate: function rehydrate(state) {
                    xhrContext = state.xhrContext;
                    xhrPath = state.xhrPath;
                    xhrTimeout = state.xhrTimeout;
                    corsPath = state.corsPath;
                }
            };
        },
        /**
         * Registers a service to the manager. Only works on the server!
         * @method registerService
         */
        registerService: function registerService(service) {
            Fetchr.registerFetcher(service);
        },
        /**
         * Get the express middleware. Only works on the server!
         * @method getMiddleware
         * @param {Object} [options] Config options to pass to Fetchr middleware.
                    See Fetchr middleware for options.
         * @returns {Function}
         */
        getMiddleware: function (options) {
            return Fetchr.middleware(options);
        },
        /**
         * Provides access to the xhr path being used by the plugin
         * @method getXhrPath
         * @returns {String}
         */
        getXhrPath: function getXhrPath() {
            return xhrPath;
        }
    };
};
