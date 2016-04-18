/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';

var EVENT_POPSTATE = 'popstate';

function isUndefined(v) {
    return v === undefined;
}

/**
 * This only supports pushState for the browsers with native pushState support.
 * For other browsers (mainly IE8 and IE9), it will refresh the page upon pushState()
 * and replaceState().
 * @class History
 * @constructor
 * @param {Object} [options]  The options object
 * @param {Window} [options.win=window]  The window object
 */
function History(options) {
    this.win = (options && options.win) || window;
    this._hasPushState = !!(this.win && this.win.history && this.win.history.pushState);
}

History.prototype = {
    /**
     * Add the given listener for 'popstate' event (nothing happens for browsers that
     * don't support popstate event).
     * @method on
     * @param {Function} listener
     */
    on: function (listener) {
        if (this._hasPushState) {
            this.win.addEventListener(EVENT_POPSTATE, listener);
        }
    },

    /**
     * Remove the given listener for 'popstate' event (nothing happens for browsers that
     * don't support popstate event).
     * @method off
     * @param {Function} listener
     */
    off: function (listener) {
        if (this._hasPushState) {
            this.win.removeEventListener(EVENT_POPSTATE, listener);
        }
    },

    /**
     * @method getState
     * @return {Object|null} The state object in history
     */
    getState: function () {
        return (this.win.history && this.win.history.state) || null;
    },

    /**
     * Gets the path string, including the pathname and search query (if it exists).
     * @method getUrl
     * @return {String} The url string that denotes current route path and query
     */
    getUrl: function () {
        // Use origUrl in the history state object first.  This is to fix the unicode
        // url issue (for browsers supporting history state):
        //   For urls containing unicode chars, window.location will automatically encode
        //   these unicode chars.  Therefore url comparison logic in handleHistory.js will
        //   break, because url in the currentNavigation of RouteStore is usually un-encoded.
        //   "origUrl" saved in the state object is in the same form as in RouteStore. So
        //   it is safer to use "origUrl" for comparison.
        var state = this.getState();
        var urlFromState = state && state.origUrl;
        var location = this.win.location;

        if (urlFromState) {
            // remove hostname from url
            var prefix = location.protocol + '//' + location.host;
            if (urlFromState.indexOf(prefix) === 0) {
                urlFromState = urlFromState.substring(prefix.length) || '/';
            }
            return urlFromState;
        }

        // fallback to what is the window.location
        return location.pathname + location.search;
    },

    /**
     * Same as HTML5 pushState API, but with old browser support
     * @method pushState
     * @param {Object} state The state object
     * @param {String} title The title string
     * @param {String} url The new url
     */
    pushState: function (state, title, url) {
        var win = this.win;
        if (this._hasPushState) {
            title = isUndefined(title) ? win.document.title : title;
            url = isUndefined(url) ? win.location.href : url;

            // remember the original url in state, so that it can be used by getUrl()
            var _state = Object.assign({origUrl: url}, state);
            try {
                win.history.pushState(_state, title, url);
            } catch (_) {
                // Handle errors by refreshing
                // See https://bugs.webkit.org/show_bug.cgi?id=155901
                win.location.href = url;
            }
            this.setTitle(title);
        } else if (url) {
            win.location.href = url;
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
        var win = this.win;
        if (this._hasPushState) {
            title = isUndefined(title) ? win.document.title : title;
            url = isUndefined(url) ? win.location.href : url;

            // remember the original url in state, so that it can be used by getUrl()
            var _state = Object.assign({origUrl: url}, state);
            try {
                win.history.replaceState(_state, title, url);
            } catch(_) {
                // Handle errors by refreshing
                // See https://bugs.webkit.org/show_bug.cgi?id=155901
                win.location.replace(url);
            }
            this.setTitle(title);
        } else if (url) {
            win.location.replace(url);
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

module.exports = History;
