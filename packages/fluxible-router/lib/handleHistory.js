/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window */
'use strict';
var React = require('react');
var debug = require('debug')('RoutingContainer');
var handleRoute = require('../lib/handleRoute');
var navigateAction = require('../lib/navigateAction');
var History = require('./History');
var TYPE_CLICK = 'click';
var TYPE_PAGELOAD = 'pageload';
var TYPE_REPLACESTATE = 'replacestate';
var TYPE_POPSTATE = 'popstate';
var TYPE_DEFAULT = 'default'; // default value if navigation type is missing, for programmatic navigation
var hoistNonReactStatics = require('hoist-non-react-statics');
var inherits = require('inherits');

var defaultOptions = {
    checkRouteOnPageLoad: false,
    enableScroll: true,
    historyCreator: function () {
        return new History();
    }
};

// Begin listening for popstate so they are not missed prior to instantiation
// this could be if the user uses back button multiple times before
// handleHistory componentDidMount fires
var EVENT_POPSTATE = 'popstate';
var HAS_PUSH_STATE = !!(typeof window !== 'undefined' && window.history && window.history.pushState);
var lastPendingPopstateEvent = null;
function preloadListener() {
    lastPendingPopstateEvent = arguments;
}
if (HAS_PUSH_STATE) {
    window.addEventListener(EVENT_POPSTATE, preloadListener);
}

// Used for ensuring that only one history handler is created
var historyCreated = false;

function createComponent(Component, opts) {
    var options = Object.assign({}, defaultOptions, opts);

    function HistoryHandler(props, context) {
        React.Component.apply(this, arguments);
    }

    inherits(HistoryHandler, React.Component);

    HistoryHandler.displayName = 'HistoryHandler';
    HistoryHandler.contextTypes = {
        executeAction: React.PropTypes.func.isRequired
    };
    HistoryHandler.propTypes = {
        currentRoute: React.PropTypes.object,
        currentNavigate: React.PropTypes.object
    };
    HistoryHandler.defaultProps = {
        currentRoute: null,
        currentNavigate: null
    };

    Object.assign(HistoryHandler.prototype, {

        componentDidMount: function () {
            if (historyCreated) {
                throw new Error('Only one history handler should be on the ' +
                'page at a time.');
            }

            // Bind the event listeners
            this._onHistoryChange = this.constructor.prototype._onHistoryChange.bind(this);
            this._onScroll = this.constructor.prototype._onScroll.bind(this);
            this._saveScrollPosition = this.constructor.prototype._saveScrollPosition.bind(this);

            this._history = options.historyCreator();
            this._scrollTimer = null;

            if (options.checkRouteOnPageLoad) {
                // You probably want to enable checkRouteOnPageLoad, if you use a history implementation
                // that supports hash route:
                //   At page load, for browsers without pushState AND hash is present in the url,
                //   since hash fragment is not sent to the server side, we need to
                //   dispatch navigate action on browser side to load the actual page content
                //   for the route represented by the hash fragment.

                var urlFromHistory = this._history.getUrl();
                var urlFromState = this.props.currentRoute && this.props.currentRoute.url;

                if ((urlFromHistory !== urlFromState)) {
                    debug('pageload navigate to actual route', urlFromHistory, urlFromState);
                    this.context.executeAction(navigateAction, {
                        type: TYPE_PAGELOAD,
                        url: urlFromHistory
                    });
                }
            }
            this._history.on(this._onHistoryChange);

            if (HAS_PUSH_STATE) {
                // We're ready to start handling the last popstate that fired
                // before the history handler was mounted.
                window.removeEventListener(EVENT_POPSTATE, preloadListener);
                if (lastPendingPopstateEvent) {
                    this._onHistoryChange.apply(this, lastPendingPopstateEvent);
                    lastPendingPopstateEvent = null;
                }
            }

            window.addEventListener('scroll', this._onScroll);
        },
        _onScroll: function (e) {
            if (this._scrollTimer) {
                window.clearTimeout(this._scrollTimer);
            }
            this._scrollTimer = window.setTimeout(this._saveScrollPosition, 150);
        },
        _onHistoryChange: function (e) {
            var props = this.props;
            var url = this._history.getUrl();
            var currentRoute = props.currentRoute || {};
            var nav = props.currentNavigate || {};

            // Add currentNavigate.externalUrl checking for https://github.com/yahoo/fluxible/issues/349:
            // "Safari popstate issue causing handleHistory.js to execute the navigateAction on page load".
            // This needs app to dispatch "externalUrl" as part of the payload for the NAVIGATE_START event
            // on server side, which contains the absolute url user sees in browser when the request is made.
            // For client side navigation, "externalUrl" field is not needed and is not set by fluxible-router.
            var externalUrl = nav.externalUrl;
            if (externalUrl && externalUrl === window.location.href.split('#')[0]) {
                // this is the initial page load, omit the popstate event erroneously fired by Safari browsers.
                return;
            }

            var currentUrl = currentRoute.url;

            var onBeforeUnloadText = typeof window.onbeforeunload === 'function' ? window.onbeforeunload() : '';
            var confirmResult = onBeforeUnloadText ? window.confirm(onBeforeUnloadText) : true;

            var navParams = nav.params || {};
            var historyState = {
                params: navParams,
                scroll: {
                    x: window.scrollX,
                    y: window.scrollY
                }
            };

            var pageTitle = navParams.pageTitle || null;

            debug('history listener invoked', e, url, currentUrl);

            if (!confirmResult) {
                // Pushes the previous history state back on top to set the correct url
                this._history.pushState(historyState, pageTitle, currentUrl);
            } else {
                if (url !== currentUrl) {
                    // Removes the window.onbeforeunload method so that the next page will not be affected
                    window.onbeforeunload = null;

                    this.context.executeAction(navigateAction, {
                        type: TYPE_POPSTATE,
                        url: url,
                        params: (e.state && e.state.params)
                    });
                }
            }

        },
        _saveScrollPosition: function (e) {
            var historyState = (this._history.getState && this._history.getState()) || {};
            historyState.scroll = {x: window.scrollX, y: window.scrollY};
            debug('remember scroll position', historyState.scroll);
            this._history.replaceState(historyState);
        },
        componentWillUnmount: function () {
            this._history.off(this._onHistoryChange);

            window.removeEventListener('scroll', this._onScroll);

            historyCreated = false;
        },
        componentDidUpdate: function (prevProps, prevState) {
            debug('component did update', prevState, this.props);

            var nav = this.props.currentNavigate || {};
            var navType = nav.type || TYPE_DEFAULT;
            var navParams = nav.params || {};
            var historyState;

            switch (navType) {
                case TYPE_CLICK:
                case TYPE_DEFAULT:
                case TYPE_REPLACESTATE:
                    if (nav.url === this._history.getUrl()) {
                        return;
                    }
                    historyState = {params: navParams};
                    if (nav.preserveScrollPosition) {
                        historyState.scroll = {x: window.scrollX, y: window.scrollY};
                    } else {
                        if (options.enableScroll) {
                            window.scrollTo(0, 0);
                            debug('on click navigation, reset scroll position to (0, 0)');
                        }
                        historyState.scroll = {x: 0, y: 0};
                    }
                    var pageTitle = navParams.pageTitle || null;
                    if (navType === TYPE_REPLACESTATE) {
                        this._history.replaceState(historyState, pageTitle, nav.url);
                    } else {
                        this._history.pushState(historyState, pageTitle, nav.url);
                    }
                    break;
                case TYPE_POPSTATE:
                    if (options.enableScroll) {
                        historyState = (this._history.getState && this._history.getState()) || {};
                        var scroll = (historyState && historyState.scroll) || {};
                        debug('on popstate navigation, restore scroll position to ', scroll);
                        window.scrollTo(scroll.x || 0, scroll.y || 0);
                    }
                    break;
            }
        },

        render: function () {
            var props = Component.prototype && Component.prototype.isReactComponent ? {ref: 'wrappedElement'} : null;
            return React.createElement(Component, Object.assign({}, this.props, props));
        }
    });

    // Copy statics to HistoryHandler
    hoistNonReactStatics(HistoryHandler, Component);

    HistoryHandler.wrappedComponent = Component;

    return handleRoute(HistoryHandler);
}

/**
 * Enhances a component to handle history management based on RouteStore
 * state.
 * @param {React.Component} Component
 * @param {object} opts
 * @param {boolean} opts.checkRouteOnPageLoad=false Performs navigate on first page load
 * @param {boolean} opts.enableScroll=true Scrolls to saved scroll position in history state;
 *                  scrolls to (0, 0) if there is no scroll position saved in history state.
 * @param {function} opts.historyCreator A factory for creating the history implementation
 * @returns {React.Component}
 */
module.exports = function handleHistory(Component, opts) {
    // support decorator pattern
    if (arguments.length === 0 || typeof arguments[0] !== 'function') {
        opts = arguments[0];
        return function handleHistoryDecorator(componentToDecorate) {
            return createComponent(componentToDecorate, opts);
        };
    }

    return createComponent.apply(null, arguments);
};
