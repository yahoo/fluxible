/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

function isUndefined(v) {
    return v === undefined;
}

/**
 * @class HistoryWithHash
 * @constructor
 * @param {Object} [options]  The options object
 * @param {Window} [options.win=window]  The window object
 * @param {Boolean} [options.useHashRoute]  Whether to use hash for routing url.
 *                If nothing specified, it will be evaluated as true if pushState feature
 *                is not available in the window object's history object; false otherwise.
 * @param {String} [options.defaultHashRoute='/'] Only used when options.useHashRoute is enabled and
                  the location url does not have any hash fragment.
 * @param {Object} [options.hashRouteTransformer]  A custom transformer can be provided
 *                to transform the hash to the desired syntax.
 * @param {Function} [options.hashRouteTransformer.transform]  transforms hash route string
 *                to custom syntax to be used in setting browser history state or url.
 *                E.g. transforms from '/about/this/path' to 'about-this-path'
 * @param {Function} [options.hashRouteTransformer.reverse]  reverse-transforms
 *                hash route string of custom syntax back to standard url syntax.
 *                E.g. transforms 'about-this-path' back to '/about/this/path'
 */
function HistoryWithHash(options) {
    options = options || {};
    this.win = options.win || window;

    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
    this._popstateEvt = this._hasPushState ? 'popstate' : 'hashchange';

    // check whether to use hash for routing
    if (typeof options.useHashRoute === 'boolean') {
        this._useHashRoute = options.useHashRoute;
    } else {
        // default behavior is to check whether browser has pushState support
        this._useHashRoute = !this._hasPushState;
    }
    this._defaultHashRoute = options.defaultHashRoute || '/';

    // allow custom syntax for hash
    if (options.hashRouteTransformer) {
        this._hashRouteTransformer = options.hashRouteTransformer;
    }
}

HistoryWithHash.prototype = {
    /**
     * Add the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        this.win.addEventListener(this._popstateEvt, listener);
    },

    /**
     * Remove the given listener for 'popstate' event (fall backs to 'hashchange' event
     * for browsers don't support popstate event).
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        this.win.removeEventListener(this._popstateEvt, listener);
    },

    /**
     * Returns the hash fragment in current window location.
     * @method _getHashRoute
     * @return {String} The hash fragment string (without the # prefix).
     * @private
     */
    _getHashRoute: function () {
        var hash = this.win.location.hash,
            transformer = this._hashRouteTransformer;

        // remove the '#' prefix
        hash = hash.substring(1) || this._defaultHashRoute;

        return (transformer && transformer.reverse) ? transformer.reverse(hash) : hash;
    },

    /**
     * @method getState
     * @return {Object|null} The state object in history
     */
    getState: function () {
        return (this.win.history && this.win.history.state) || null;
    },

    /**
     * Gets the path string (or hash fragment if the history object is
     * configured to use hash for routing),
     * including the pathname and search query (if it exists).
     * @method getUrl
     * @return {String} The url string that denotes current path and query
     */
    getUrl: function () {
        var location = this.win.location,
            path = location.pathname + location.search;

        if (this._useHashRoute) {
            return this._getHashRoute();
        }
        return path;
    },

    /**
     * Same as HTML5 pushState API, but with old browser support
     * @method pushState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    pushState: function (state, title, url) {
        var win = this.win,
            history = win.history,
            location = win.location,
            hash,
            transformer = this._hashRouteTransformer;

        if (this._useHashRoute) {
            hash = (transformer && transformer.transform) ? transformer.transform(url) : url;
            if (hash) {
                hash = '#' + hash;
            }
            if (this._hasPushState) {
                url = hash ? location.pathname + location.search + hash : null;
                history.pushState(state, title, url);
                this.setTitle(title);
            } else if (hash) {
                location.hash = hash;
            }
        } else {
            if (this._hasPushState) {
                title = isUndefined(title) ? win.document.title : title;
                url = isUndefined(url) ? win.location.href : url;
                history.pushState(state, title, url);
                this.setTitle(title);
            } else if (url) {
                location.href = url;
            }
        }
    },

    /**
     * Same as HTML5 replaceState API, but with old browser support
     * @method replaceState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    replaceState: function (state, title, url) {
        var win = this.win,
            history = win.history,
            location = win.location,
            hash,
            transformer = this._hashRouteTransformer;

        if (this._useHashRoute) {
            hash = (transformer && transformer.transform) ? transformer.transform(url) : url;
            if (hash) {
                hash = '#' + hash;
            }
            if (this._hasPushState) {
                url = hash ? (location.pathname + location.search + hash) : null;
                history.replaceState(state, title, url);
                this.setTitle(title);
            } else if (url) {
                url = location.pathname + location.search + hash;
                location.replace(url);
            }
        } else {
            if (this._hasPushState) {
                title = isUndefined(title) ? win.document.title : title;
                url = isUndefined(url) ? win.location.href : url;
                history.replaceState(state, title, url);
                this.setTitle(title);
            } else if (url) {
                location.replace(url);
            }
        }
    },

    /**
     * Sets document title. No-op if title is empty.
     * @param {String} title  The title string.
     */
    setTitle: function (title) {
        if (title) {
            this.win.document.title = title;
        }
    }
};

module.exports = HistoryWithHash;
